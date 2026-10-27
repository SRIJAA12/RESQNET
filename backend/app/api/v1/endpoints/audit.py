from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.audit import AuditEvent
from app.schemas.audit import AuditEventCreate, AuditEventResponse
from app.schemas.common import APIResponse, PaginatedResponse, PaginationMeta
from app.core.security import get_current_user, require_role, AuthUser

router = APIRouter(prefix="/audit-logs", tags=["Audit Trail & Security Logs"])


@router.get("", response_model=PaginatedResponse[AuditEventResponse])
def list_audit_logs(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (incident, assignment, resource, shelter, inventory)"),
    search: Optional[str] = Query(None, description="Search by action or actor"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEvent)
    if entity_type and entity_type.lower() != "all":
        query = query.filter(AuditEvent.entity_type == entity_type)
    if search:
        query = query.filter(
            (AuditEvent.action.ilike(f"%{search}%")) |
            (AuditEvent.performed_by.ilike(f"%{search}%"))
        )

    total_count = query.count()
    skip = (page - 1) * page_size
    items = query.order_by(AuditEvent.timestamp.desc()).offset(skip).limit(page_size).all()
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        items=[AuditEventResponse.model_validate(a) for a in items],
        pagination=PaginationMeta(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.post("", response_model=APIResponse[AuditEventResponse], status_code=status.HTTP_201_CREATED)
def record_audit_log(
    entry_in: AuditEventCreate,
    db: Session = Depends(get_db),
    current_user: AuthUser = Depends(get_current_user)
):
    event = AuditEvent(
        entity_type=entry_in.entity_type,
        entity_id=entry_in.entity_id,
        action=entry_in.action,
        performed_by=entry_in.performed_by or current_user.email,
        changes_json=entry_in.changes_json,
        ip_address=entry_in.ip_address or "127.0.0.1"
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return APIResponse(
        success=True,
        message="Audit event recorded",
        data=AuditEventResponse.model_validate(event)
    )
