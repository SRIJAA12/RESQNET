from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.event import DisasterEventCreate, DisasterEventResponse
from app.schemas.common import APIResponse
from app.services.event_service import EventService
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/events", tags=["Disaster Events"])


@router.get("", response_model=APIResponse[List[DisasterEventResponse]])
def list_events(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    service = EventService(db)
    events = service.list_events(active_only=active_only)
    return APIResponse(
        success=True,
        data=[DisasterEventResponse.model_validate(e) for e in events]
    )


@router.post("", response_model=APIResponse[DisasterEventResponse], status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: DisasterEventCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    service = EventService(db)
    event = service.create_event(event_in)
    return APIResponse(
        success=True,
        message="Disaster event successfully initialized",
        data=DisasterEventResponse.model_validate(event)
    )
