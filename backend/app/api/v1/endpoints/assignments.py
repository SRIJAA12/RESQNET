from typing import List, Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.assignment import AssignmentCreate, AssignmentResponse
from app.schemas.common import APIResponse
from app.services.assignment_service import AssignmentService
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/assignments", tags=["Resource Assignments & Dispatch"])


@router.post("", response_model=APIResponse[AssignmentResponse], status_code=status.HTTP_201_CREATED)
def create_assignment(
    assignment_in: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    """
    Transaction-safe assignment approval and dispatch endpoint.
    Ensures that a resource cannot be concurrently assigned to multiple active incidents.
    Requires authorized human dispatcher role.
    """
    service = AssignmentService(db)
    assignment = service.create_assignment(
        data=assignment_in,
        dispatcher_user_id=current_user.user_id,
        dispatcher_email=current_user.email
    )
    return APIResponse(
        success=True,
        message=f"Resource successfully assigned with status '{assignment.status.value}'.",
        data=AssignmentResponse.model_validate(assignment)
    )


@router.get("", response_model=APIResponse[List[AssignmentResponse]])
def list_assignments(
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
    db: Session = Depends(get_db)
):
    service = AssignmentService(db)
    items, _ = service.list_assignments(status=status, page=page, page_size=page_size)
    return APIResponse(
        success=True,
        data=[AssignmentResponse.model_validate(a) for a in items]
    )


@router.get("/incident/{incident_id}", response_model=APIResponse[List[AssignmentResponse]])
def get_incident_assignments(
    incident_id: str,
    db: Session = Depends(get_db)
):
    service = AssignmentService(db)
    assignments = service.list_by_incident(incident_id)
    return APIResponse(
        success=True,
        data=[AssignmentResponse.model_validate(a) for a in assignments]
    )


@router.patch("/{assignment_id}/status", response_model=APIResponse[AssignmentResponse])
def update_assignment_status(
    assignment_id: str,
    status_in: dict,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(require_role("dispatcher"))
):
    from fastapi import HTTPException
    from app.models.assignment import AssignmentStatusEnum
    new_status_str = status_in.get("status")
    try:
        new_status = AssignmentStatusEnum(new_status_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid assignment status: '{new_status_str}'."
        )

    service = AssignmentService(db)
    assignment = service.update_assignment_status(
        assignment_id=assignment_id,
        new_status=new_status,
        notes=status_in.get("notes"),
        cancellation_reason=status_in.get("cancellation_reason"),
        updated_by=current_user.email
    )
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Assignment '{assignment_id}' was not found."
        )
    return APIResponse(
        success=True,
        message=f"Assignment status updated to '{new_status.value}'.",
        data=AssignmentResponse.model_validate(assignment)
    )
