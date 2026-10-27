from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.incident import (
    IncidentCreate, IncidentResponse, IncidentStatusUpdate
)
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from app.services.incident_service import IncidentService
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/incidents", tags=["Incidents & SOS"])


@router.get("", response_model=PaginatedResponse[IncidentResponse])
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    search: Optional[str] = Query(None, description="Search reference code, location or description"),
    sync: bool = Query(False, description="Auto-sync newly submitted serverless SOS reports"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    if sync:
        try:
            from app.services.incident_sync_service import IncidentSyncService
            IncidentSyncService(db).sync_all_submitted_from_dynamo()
        except Exception:
            pass

    service = IncidentService(db)
    items, total_count = service.list_incidents(
        status=status,
        priority=priority,
        event_id=event_id,
        search=search,
        page=page,
        page_size=page_size
    )
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        items=[IncidentResponse.model_validate(inc) for inc in items],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.post("", response_model=APIResponse[IncidentResponse], status_code=status.HTTP_201_CREATED)
def create_incident(
    incident_in: IncidentCreate,
    db: Session = Depends(get_db)
):
    """
    Public Citizen SOS Entry Point.
    Accepts emergency requests, runs assistive AI triage, and generates a tracking reference code.
    """
    service = IncidentService(db)
    incident = service.create_incident(incident_in)
    return APIResponse(
        success=True,
        message="Emergency SOS received. Dispatchers have been alerted.",
        data=IncidentResponse.model_validate(incident)
    )


@router.get("/ref/{reference_code}", response_model=APIResponse[IncidentResponse])
def get_incident_by_reference(
    reference_code: str,
    db: Session = Depends(get_db)
):
    service = IncidentService(db)
    incident = service.get_by_reference(reference_code)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident with reference '{reference_code}' was not found."
        )
    return APIResponse(
        success=True,
        data=IncidentResponse.model_validate(incident)
    )


@router.get("/{incident_id}", response_model=APIResponse[IncidentResponse])
def get_incident(
    incident_id: str,
    db: Session = Depends(get_db)
):
    service = IncidentService(db)
    incident = service.get_incident(incident_id)
    if not incident:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' was not found."
        )
    return APIResponse(
        success=True,
        data=IncidentResponse.model_validate(incident)
    )


@router.post("/sync", response_model=APIResponse[dict])
def sync_serverless_incidents(
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    """
    Synchronizes newly submitted citizen SOS reports from serverless DynamoDB
    into the operational PostgreSQL database. Requires authorized dispatcher role.
    """
    from app.services.incident_sync_service import IncidentSyncService
    service = IncidentSyncService(db)
    summary = service.sync_all_submitted_from_dynamo()
    return APIResponse(
        success=True,
        message=f"Synchronized {summary['synced_count']} new incident(s) from serverless ingestion.",
        data=summary
    )


@router.patch("/{incident_id}/status", response_model=APIResponse[IncidentResponse])
def update_incident_status(
    incident_id: str,
    status_update: IncidentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    """
    Update incident status. Requires authorized human dispatcher role.
    """
    service = IncidentService(db)
    try:
        updated = service.update_incident_status(
            incident_id=incident_id,
            update=status_update,
            changed_by_user_id=current_user.user_id,
            performed_by_name=current_user.email
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident '{incident_id}' was not found."
        )
    return APIResponse(
        success=True,
        message=f"Incident status updated to '{status_update.status.value}'.",
        data=IncidentResponse.model_validate(updated)
    )

