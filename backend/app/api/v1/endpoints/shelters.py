from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.shelter import ShelterCreate, ShelterResponse, ShelterUpdate
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from app.services.shelter_service import ShelterService
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/shelters", tags=["Shelters & Capacity"])


@router.get("", response_model=PaginatedResponse[ShelterResponse])
def list_shelters(
    status: Optional[str] = Query(None, description="Filter by status (active, full, closed)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = ShelterService(db)
    items, total_count = service.list_shelters(status=status, page=page, page_size=page_size)
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        items=[ShelterResponse.model_validate(s) for s in items],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.post("", response_model=APIResponse[ShelterResponse], status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: ShelterCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    service = ShelterService(db)
    shelter = service.create_shelter(shelter_in, creator_email=current_user.email)
    return APIResponse(
        success=True,
        message="Shelter facility registered successfully",
        data=ShelterResponse.model_validate(shelter)
    )


@router.patch("/{shelter_id}", response_model=APIResponse[ShelterResponse])
def update_shelter(
    shelter_id: str,
    update_in: ShelterUpdate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    service = ShelterService(db)
    shelter = service.update_shelter(shelter_id, update_in, user_email=current_user.email)
    if not shelter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Shelter '{shelter_id}' was not found."
        )
    return APIResponse(
        success=True,
        message="Shelter capacity updated successfully",
        data=ShelterResponse.model_validate(shelter)
    )
