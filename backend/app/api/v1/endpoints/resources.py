from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.resource import ResourceCreate, ResourceResponse
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from app.services.resource_service import ResourceService
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/resources", tags=["Resources & Fleet"])


@router.get("", response_model=PaginatedResponse[ResourceResponse])
def list_resources(
    status: Optional[str] = Query(None, description="Filter by status (available, deployed, maintenance)"),
    resource_type: Optional[str] = Query(None, description="Filter by type (boat, ambulance, drone, etc)"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    service = ResourceService(db)
    items, total_count = service.list_resources(
        status=status,
        resource_type=resource_type,
        page=page,
        page_size=page_size
    )
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        items=[ResourceResponse.model_validate(r) for r in items],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.post("", response_model=APIResponse[ResourceResponse], status_code=status.HTTP_201_CREATED)
def create_resource(
    resource_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    service = ResourceService(db)
    resource = service.create_resource(resource_in, creator_email=current_user.email)
    return APIResponse(
        success=True,
        message="Resource unit registered successfully",
        data=ResourceResponse.model_validate(resource)
    )


@router.get("/{resource_id}", response_model=APIResponse[ResourceResponse])
def get_resource(
    resource_id: str,
    db: Session = Depends(get_db)
):
    service = ResourceService(db)
    resource = service.get_resource(resource_id)
    if not resource:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{resource_id}' was not found."
        )
    return APIResponse(
        success=True,
        data=ResourceResponse.model_validate(resource)
    )


@router.patch("/{resource_id}/status", response_model=APIResponse[ResourceResponse])
def update_resource_status(
    resource_id: str,
    status_in: dict,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    from fastapi import HTTPException
    from app.models.resource import ResourceStatusEnum
    new_status_str = status_in.get("status")
    try:
        new_status = ResourceStatusEnum(new_status_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid resource status: '{new_status_str}'."
        )
    notes = status_in.get("notes") or status_in.get("operational_notes")
    service = ResourceService(db)
    resource = service.update_resource_status(
        resource_id=resource_id,
        new_status=new_status,
        operational_notes=notes,
        updated_by=current_user.email
    )
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resource '{resource_id}' was not found."
        )
    return APIResponse(
        success=True,
        message=f"Resource status updated to '{new_status.value}'.",
        data=ResourceResponse.model_validate(resource)
    )
