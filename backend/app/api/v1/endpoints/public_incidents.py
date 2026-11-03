"""
Public citizen SOS endpoints — no authentication required.

Replaces the former AWS Lambda + API Gateway + DynamoDB pipeline entirely.
All data is persisted directly to PostgreSQL via the existing IncidentService.

Routes:
  POST  /v1/public/incidents            — Submit a new citizen SOS
  GET   /v1/public/incidents/ref/{ref}  — Track an existing incident by reference code
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.public_incident import (
    PublicIncidentCreate,
    PublicIncidentCreationResponse,
    SanitizedIncidentTrackingResponse,
    SanitizedIncidentMilestone,
)
from app.schemas.incident import IncidentCreate
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/public/incidents", tags=["Citizen SOS (Public)"])


@router.post(
    "",
    response_model=PublicIncidentCreationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Citizen Emergency SOS",
    description=(
        "Public endpoint — no authentication required. "
        "Accepts a citizen emergency report, runs AI-assisted triage, "
        "persists directly to PostgreSQL, and returns a tracking reference code."
    ),
)
def submit_citizen_sos(
    payload: PublicIncidentCreate,
    db: Session = Depends(get_db),
) -> PublicIncidentCreationResponse:
    # Map the public schema onto the internal IncidentCreate schema
    incident_in = IncidentCreate(
        reporter_name=payload.reporter_name,
        reporter_contact=payload.reporter_contact,
        reporter_is_victim=payload.reporter_is_victim,
        disaster_type=payload.disaster_type,
        people_count=payload.people_count,
        trapped_count=payload.trapped_count,
        medical_assistance_needed=payload.medical_assistance_needed,
        special_needs_description=payload.special_needs_description,
        description=payload.description,
        address_text=payload.address_text,
        latitude=payload.latitude,
        longitude=payload.longitude,
        event_id=payload.event_id,
    )

    service = IncidentService(db)
    incident = service.create_incident(incident_in)

    return PublicIncidentCreationResponse(
        reference_code=incident.reference_code,
        incident_id=incident.id,
        status=incident.status.value,
        priority=incident.priority.value,
        created_at=incident.created_at.isoformat(),
        tracking_url=f"/v1/public/incidents/ref/{incident.reference_code}",
        message="Emergency SOS received. Dispatchers have been alerted.",
    )


@router.get(
    "/ref/{reference_code}",
    response_model=SanitizedIncidentTrackingResponse,
    summary="Track Citizen SOS by Reference Code",
    description=(
        "Public endpoint — no authentication required. "
        "Returns sanitized incident status for a citizen's reference code. "
        "Deliberately omits PII (reporter contact, exact coordinates, internal dispatcher notes)."
    ),
)
def track_incident_by_reference(
    reference_code: str,
    db: Session = Depends(get_db),
) -> SanitizedIncidentTrackingResponse:
    clean_ref = reference_code.strip().upper()
    service = IncidentService(db)
    incident = service.get_by_reference(clean_ref)

    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with reference '{clean_ref}' was not found. "
                   "Please verify the code from your submission receipt.",
        )

    # Build sanitized milestone history — strip changed_by_user_id and internal notes if needed
    history = [
        SanitizedIncidentMilestone(
            status=h.new_status,
            timestamp=h.created_at.isoformat(),
            notes=h.notes,
        )
        for h in (incident.status_history or [])
    ]

    return SanitizedIncidentTrackingResponse(
        reference_code=incident.reference_code,
        status=incident.status.value,
        priority=incident.priority.value,
        created_at=incident.created_at.isoformat(),
        updated_at=incident.updated_at.isoformat(),
        disaster_type=incident.disaster_type,
        people_count=incident.people_count,
        trapped_count=incident.trapped_count,
        medical_assistance_needed=incident.medical_assistance_needed,
        special_needs_description=incident.special_needs_description,
        description=incident.description,
        address_text=incident.address_text,
        status_history=history,
    )

