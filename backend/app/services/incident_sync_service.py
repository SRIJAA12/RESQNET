import logging
from typing import Dict, Any, Optional, Tuple, List
from sqlalchemy.orm import Session

from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum
from app.repositories.incident_repo import IncidentRepository
from app.repositories.audit_repo import AuditRepository

logger = logging.getLogger(__name__)


def _get_dynamo_repository():
    """Lazily retrieves the active serverless DynamoDB repository."""
    try:
        from backend_serverless.repository.dynamo_repo import get_incident_repository
        return get_incident_repository()
    except Exception as e:
        logger.warning("Could not access serverless DynamoDB repository: %s", str(e))
        return None


class IncidentSyncService:
    """
    Bi-directional synchronization service connecting serverless Citizen SOS
    submissions (DynamoDB source of truth) with operational dispatcher workflows
    (PostgreSQL/PostGIS source of truth).
    """

    def __init__(self, db: Session, dynamo_repo: Optional[Any] = None):
        self.db = db
        self.repo = IncidentRepository(db)
        self.audit_repo = AuditRepository(db)
        self.dynamo_repo = dynamo_repo or _get_dynamo_repository()

    def sync_incident_from_dynamo(self, dynamo_item: Dict[str, Any]) -> Tuple[Incident, bool]:
        """
        Idempotently synchronizes a single DynamoDB citizen incident into PostgreSQL.
        Returns (incident, is_new).
        Guarantees that duplicate deliveries or repeated syncs do not create duplicate records.
        """
        ref_code = dynamo_item.get("reference_code")
        if not ref_code:
            raise ValueError("DynamoDB item missing required 'reference_code'")

        # 1. Idempotency check: see if record already exists in PostgreSQL
        existing = self.repo.get_by_reference(ref_code)
        if existing:
            logger.debug("Incident with reference '%s' already synchronized in PostgreSQL", ref_code)
            return existing, False

        # 2. Extract and sanitize fields
        disaster_type = str(dynamo_item.get("disaster_type", "flood")).lower()
        raw_status = str(dynamo_item.get("status", "submitted")).lower()
        raw_priority = str(dynamo_item.get("priority", "medium")).lower()

        # Map to canonical enum values
        try:
            status_enum = IncidentStatusEnum(raw_status)
        except ValueError:
            status_enum = IncidentStatusEnum.SUBMITTED

        try:
            priority_enum = IncidentPriorityEnum(raw_priority)
        except ValueError:
            priority_enum = IncidentPriorityEnum.MEDIUM

        lat = float(dynamo_item.get("latitude", 0.0))
        lng = float(dynamo_item.get("longitude", 0.0))
        wkt_geom = f"SRID=4326;POINT({lng} {lat})"

        people_count = int(dynamo_item.get("people_count", 1))
        trapped_count = int(dynamo_item.get("trapped_count", 0))
        medical_needed = bool(dynamo_item.get("medical_assistance_needed", False))

        # Assistive triage heuristic score for dispatchers
        score = 20.0
        if medical_needed:
            score += 40.0
        if trapped_count > 0:
            score += min(30.0, trapped_count * 10.0)
        if people_count >= 5:
            score += 10.0
        score = min(100.0, score)

        # 3. Construct and persist PostgreSQL incident model
        incident = Incident(
            reference_code=ref_code,
            event_id=dynamo_item.get("event_id"),
            reporter_name=dynamo_item.get("reporter_name", "Anonymous Citizen"),
            reporter_contact=dynamo_item.get("reporter_contact", "N/A"),
            reporter_is_victim=bool(dynamo_item.get("reporter_is_victim", True)),
            disaster_type=disaster_type,
            status=status_enum,
            priority=priority_enum,
            people_count=people_count,
            trapped_count=trapped_count,
            medical_assistance_needed=medical_needed,
            special_needs_description=dynamo_item.get("special_needs_description"),
            description=dynamo_item.get("description", "Emergency SOS via serverless pipeline"),
            address_text=dynamo_item.get("address_text", "Unknown location"),
            latitude=lat,
            longitude=lng,
            geom=wkt_geom,
            ai_triage_score=score,
            ai_suggested_priority=priority_enum.value,
            ai_recommendation_notes=(
                f"Synchronized from Serverless SOS ingestion. Initial Priority: {priority_enum.value.upper()}. "
                f"[Advisory only: Requires human dispatcher verification]"
            ),
        )

        saved = self.repo.create(incident)

        # Record initial status in PostgreSQL history
        self.repo.add_status_history(
            incident_id=saved.id,
            previous_status=None,
            new_status=status_enum.value,
            notes="Synchronized from Serverless Citizen SOS pipeline",
        )

        # Record audit log (never log sensitive personal contact info)
        self.audit_repo.record_event(
            entity_type="incident",
            entity_id=saved.id,
            action="serverless_sos_synchronized",
            performed_by="system_sync_bridge",
            changes={"reference_code": ref_code, "priority": priority_enum.value},
        )

        logger.info("Successfully synchronized new serverless incident reference: %s into PostgreSQL", ref_code)
        return saved, True

    def sync_all_submitted_from_dynamo(self, limit: int = 50) -> Dict[str, Any]:
        """
        Scans DynamoDB for 'submitted' SOS incidents via GSI1 and ingests them into PostgreSQL.
        Returns a summary of items synchronized, skipped, and total examined.
        """
        if not self.dynamo_repo:
            logger.warning("No active DynamoDB repository available for synchronization")
            return {"synced_count": 0, "skipped_count": 0, "total_examined": 0, "items": []}

        try:
            items = self.dynamo_repo.list_by_status("submitted", limit=limit)
        except Exception as e:
            logger.error("Failed to query DynamoDB for submitted incidents: %s", str(e))
            raise RuntimeError(f"DynamoDB synchronization query failed: {str(e)}") from e

        synced_count = 0
        skipped_count = 0
        synced_records = []

        for item in items:
            try:
                inc, is_new = self.sync_incident_from_dynamo(item)
                if is_new:
                    synced_count += 1
                    synced_records.append(inc.reference_code)
                else:
                    skipped_count += 1
            except Exception as item_err:
                logger.error("Error synchronizing item with ref %s: %s", item.get("reference_code"), str(item_err))

        return {
            "synced_count": synced_count,
            "skipped_count": skipped_count,
            "total_examined": len(items),
            "synced_references": synced_records,
        }

    def push_status_milestone_to_dynamo(
        self,
        reference_code: str,
        new_status: str,
        notes: Optional[str] = None,
    ) -> bool:
        """
        Pushes an authorized operational status milestone update back to DynamoDB.
        Guarantees that public citizen tracking reflects dispatcher verification,
        responder dispatch, and incident resolution without leaking private operational details.
        """
        if not self.dynamo_repo:
            logger.warning("DynamoDB repository unavailable; cannot push status milestone for %s", reference_code)
            return False

        try:
            result = self.dynamo_repo.update_status_by_reference(
                reference_code=reference_code,
                new_status=new_status,
                notes=notes,
            )
            if result:
                logger.info("Pushed milestone '%s' for reference '%s' to DynamoDB", new_status, reference_code)
                return True
            else:
                logger.warning("Reference '%s' not found in DynamoDB during milestone push", reference_code)
                return False
        except Exception as e:
            logger.error("Failed to push status milestone to DynamoDB for '%s': %s", reference_code, str(e))
            return False
