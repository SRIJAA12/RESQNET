import random
import string
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum
from app.schemas.incident import IncidentCreate, IncidentStatusUpdate
from app.repositories.incident_repo import IncidentRepository
from app.repositories.audit_repo import AuditRepository


class IncidentService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = IncidentRepository(db)
        self.audit_repo = AuditRepository(db)

    @staticmethod
    def _generate_reference_code() -> str:
        suffix = "".join(random.choices(string.digits, k=4))
        return f"SOS-2026-FLOOD-{suffix}"

    @staticmethod
    def _calculate_ai_triage(data: IncidentCreate) -> Tuple[float, IncidentPriorityEnum, str]:
        """
        AI-assisted triage heuristic engine.
        Calculates a priority score (0.0 to 100.0) based on vulnerability factors.
        STRICT SAFETY CONSTRAINT: This recommendation is strictly assistive and advisory.
        Authorized human dispatchers must review and approve all operational decisions.
        """
        score = 10.0
        reasons = []

        if data.medical_assistance_needed:
            score += 35.0
            reasons.append("Immediate medical assistance requested")

        if data.trapped_count > 0:
            trapped_impact = min(30.0, data.trapped_count * 10.0)
            score += trapped_impact
            reasons.append(f"{data.trapped_count} individual(s) trapped above rising flood level")

        if data.special_needs_description and len(data.special_needs_description.strip()) > 0:
            score += 15.0
            reasons.append("Vulnerable individuals / special needs present (infant/elderly/disabled)")

        if data.people_count > 5:
            score += 10.0
            reasons.append(f"Large group ({data.people_count} individuals)")

        score = min(100.0, score)

        if score >= 70.0:
            suggested = IncidentPriorityEnum.CRITICAL
        elif score >= 45.0:
            suggested = IncidentPriorityEnum.HIGH
        elif score >= 20.0:
            suggested = IncidentPriorityEnum.MEDIUM
        else:
            suggested = IncidentPriorityEnum.LOW

        notes = (
            f"AI Triage Score: {score:.1f}/100 -> Suggested Priority: {suggested.value.upper()}. "
            f"Factors: {'; '.join(reasons) if reasons else 'Standard reporting'}. "
            f"[Advisory only: Requires human dispatcher verification]"
        )
        return score, suggested, notes

    def create_incident(self, data: IncidentCreate) -> Incident:
        ref_code = self._generate_reference_code()
        ai_score, ai_priority, ai_notes = self._calculate_ai_triage(data)

        # In PostgreSQL with PostGIS, geometry point is constructed from lon/lat
        # GeoAlchemy2 accepts WKT string 'POINT(lon lat)'
        wkt_geom = f"SRID=4326;POINT({data.longitude} {data.latitude})"

        incident = Incident(
            reference_code=ref_code,
            event_id=data.event_id,
            reporter_name=data.reporter_name,
            reporter_contact=data.reporter_contact,
            reporter_is_victim=data.reporter_is_victim,
            disaster_type=data.disaster_type,
            status=IncidentStatusEnum.SUBMITTED,
            priority=ai_priority,
            people_count=data.people_count,
            trapped_count=data.trapped_count,
            medical_assistance_needed=data.medical_assistance_needed,
            special_needs_description=data.special_needs_description,
            description=data.description,
            address_text=data.address_text,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=wkt_geom,
            ai_triage_score=ai_score,
            ai_suggested_priority=ai_priority.value,
            ai_recommendation_notes=ai_notes
        )

        saved = self.repo.create(incident)

        # Record initial status in history
        self.repo.add_status_history(
            incident_id=saved.id,
            previous_status=None,
            new_status=IncidentStatusEnum.SUBMITTED.value,
            notes="Citizen SOS request submitted"
        )

        # Audit log
        self.audit_repo.record_event(
            entity_type="incident",
            entity_id=saved.id,
            action="citizen_sos_created",
            performed_by=data.reporter_contact,
            changes={"reference_code": ref_code, "priority": ai_priority.value}
        )

        return saved

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        return self.repo.get_by_id(incident_id)

    def get_by_reference(self, reference_code: str) -> Optional[Incident]:
        return self.repo.get_by_reference(reference_code)

    def list_incidents(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        event_id: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Incident], int]:
        skip = (page - 1) * page_size
        return self.repo.filter_incidents(
            status=status,
            priority=priority,
            event_id=event_id,
            search=search,
            skip=skip,
            limit=page_size
        )

    def update_incident_status(
        self,
        incident_id: str,
        update: IncidentStatusUpdate,
        changed_by_user_id: Optional[str] = None,
        performed_by_name: str = "dispatcher"
    ) -> Optional[Incident]:
        incident = self.repo.get_by_id(incident_id)
        if not incident:
            return None

        previous_status = incident.status.value
        new_status = update.status.value

        incident.status = update.status
        updated = self.repo.update(incident)

        # Add history entry
        self.repo.add_status_history(
            incident_id=incident.id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by_user_id=changed_by_user_id,
            notes=update.notes
        )

        # Audit log
        self.audit_repo.record_event(
            entity_type="incident",
            entity_id=incident.id,
            action="status_updated",
            performed_by=performed_by_name,
            changes={"from": previous_status, "to": new_status, "notes": update.notes}
        )

        return updated
