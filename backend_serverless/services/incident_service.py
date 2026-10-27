"""
Domain service implementing the citizen SOS incident ingestion and sanitized tracking logic.
"""
import re
import uuid
import secrets
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, List

from schemas.incident import (
    PublicIncidentCreate,
    PublicIncidentCreationResponse,
    SanitizedIncidentMilestone,
    SanitizedIncidentTrackingResponse,
)
from repository.dynamo_repo import IncidentRepository


def generate_reference_code(disaster_type: str) -> str:
    """
    Generates a unique, collision-resistant human-readable public reference code.
    Format: SOS-<YEAR>-<DISASTER>-<SUFFIX>
    Example: SOS-2026-FLOOD-8492
    """
    year = datetime.now(timezone.utc).year
    # Clean and uppercase disaster type (alphanumeric only, max 8 chars)
    clean_type = re.sub(r"[^A-Za-z0-9]", "", disaster_type).upper()[:8]
    if not clean_type:
        clean_type = "EMERGENCY"

    # 4-character suffix from unambiguous alphanumeric characters
    charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    suffix = "".join(secrets.choice(charset) for _ in range(4))

    return f"SOS-{year}-{clean_type}-{suffix}"


def determine_initial_priority(payload: PublicIncidentCreate) -> str:
    """
    Calculates initial triage priority based on vulnerability and acute threat signals.
    """
    if payload.medical_assistance_needed or payload.trapped_count > 0:
        return "critical"
    if payload.people_count >= 5:
        return "high"
    return "medium"


def create_citizen_incident(
    payload: PublicIncidentCreate,
    repo: IncidentRepository,
    incident_id: Optional[str] = None,
    reference_code: Optional[str] = None,
) -> PublicIncidentCreationResponse:
    """
    Validates, constructs, and persists a new public citizen emergency report.
    Guarantees collision prevention via repository conditional writes.
    """
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat().replace("+00:00", "Z")

    inc_id = incident_id or f"inc-{uuid.uuid4().hex[:12]}"
    ref_code = reference_code or generate_reference_code(payload.disaster_type)
    priority = determine_initial_priority(payload)
    status = "submitted"  # Initial unverified/pending-review state

    # Build DynamoDB single-table item conforming to agreed schema
    item: Dict[str, Any] = {
        # Core Keys
        "PK": f"INC#{inc_id}",
        "SK": "METADATA",
        # GSI1: Status queue access pattern (STATUS#<status> / <created_at>)
        "GSI1_PK": f"STATUS#{status}",
        "GSI1_SK": now_iso,
        # GSI2: Public reference lookup (REF#<ref_code> / METADATA)
        "GSI2_PK": f"REF#{ref_code}",
        "GSI2_SK": "METADATA",
        # Domain Attributes
        "incident_id": inc_id,
        "reference_code": ref_code,
        "event_id": payload.event_id,
        "reporter_name": payload.reporter_name,
        "reporter_contact": payload.reporter_contact,
        "reporter_is_victim": payload.reporter_is_victim,
        "disaster_type": payload.disaster_type.lower(),
        "status": status,
        "priority": priority,
        "people_count": payload.people_count,
        "trapped_count": payload.trapped_count,
        "medical_assistance_needed": payload.medical_assistance_needed,
        "special_needs_description": payload.special_needs_description,
        "description": payload.description,
        "address_text": payload.address_text,
        "latitude": Decimal(str(payload.latitude)),
        "longitude": Decimal(str(payload.longitude)),
        "created_at": now_iso,
        "updated_at": now_iso,
        "status_history": [
            {
                "status": status,
                "timestamp": now_iso,
                "notes": "Emergency SOS registered via public citizen pipeline",
            }
        ],
    }

    # Persist via repository with conditional check
    repo.put_incident(item)

    return PublicIncidentCreationResponse(
        reference_code=ref_code,
        incident_id=inc_id,
        status=status,
        priority=priority,
        created_at=now_iso,
        tracking_url=f"/v1/public/incidents/ref/{ref_code}",
        message="Emergency request submitted successfully. Responders will verify details.",
    )


def get_sanitized_incident_tracking(
    reference_code: str,
    repo: IncidentRepository,
    max_retries: int = 2,
    retry_delay_seconds: float = 0.05,
) -> Optional[SanitizedIncidentTrackingResponse]:
    """
    Resolves the reference code via GSI2 with bounded, low-latency retries
    to safely mitigate DynamoDB Global Secondary Index eventual consistency lag.
    Omits reporter contact details, internal notes, dispatcher IDs, and raw DynamoDB keys.
    """
    import time
    clean_ref = reference_code.strip().upper()
    item = None

    for attempt in range(max_retries + 1):
        item = repo.get_by_reference(clean_ref)
        if item is not None:
            break
        if attempt < max_retries and retry_delay_seconds > 0:
            time.sleep(retry_delay_seconds)

    if not item:
        return None

    history_records: List[SanitizedIncidentMilestone] = []
    for h in item.get("status_history", []):
        history_records.append(
            SanitizedIncidentMilestone(
                status=h.get("status", ""),
                timestamp=h.get("timestamp", ""),
                notes=h.get("notes"),
            )
        )

    return SanitizedIncidentTrackingResponse(
        reference_code=item.get("reference_code", clean_ref),
        status=item.get("status", "submitted"),
        priority=item.get("priority", "medium"),
        created_at=item.get("created_at", ""),
        updated_at=item.get("updated_at", item.get("created_at", "")),
        disaster_type=item.get("disaster_type", "emergency"),
        people_count=int(item.get("people_count", 1)),
        trapped_count=int(item.get("trapped_count", 0)),
        medical_assistance_needed=bool(item.get("medical_assistance_needed", False)),
        special_needs_description=item.get("special_needs_description"),
        description=item.get("description", ""),
        address_text=item.get("address_text", ""),
        status_history=history_records,
    )


def update_incident_status_milestone(
    reference_code: str,
    new_status: str,
    notes: Optional[str] = None,
    repo: Optional[IncidentRepository] = None,
) -> Optional[Dict[str, Any]]:
    """
    Updates the operational lifecycle status and appends a milestone note in DynamoDB.
    Returns the updated DynamoDB item dict or None if reference code is not found.
    """
    if repo is None:
        from repository.dynamo_repo import get_incident_repository
        repo = get_incident_repository()

    return repo.update_status_by_reference(
        reference_code=reference_code,
        new_status=new_status,
        notes=notes,
    )

