from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.assignment import AssignmentStatusEnum
from app.schemas.resource import ResourceResponse


class AssignmentCreate(BaseModel):
    incident_id: str = Field(..., description="Target incident UUID")
    resource_id: str = Field(..., description="Target resource/responder UUID")
    dispatcher_notes: Optional[str] = Field(None, max_length=1000)
    auto_dispatch: bool = Field(False, description="Whether to immediately transition to dispatched")


class AssignmentUpdate(BaseModel):
    status: AssignmentStatusEnum
    notes: Optional[str] = None
    cancellation_reason: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: str
    incident_id: str
    resource_id: str
    status: AssignmentStatusEnum
    assigned_by_user_id: Optional[str]
    dispatcher_notes: Optional[str]
    dispatched_at: Optional[datetime]
    completed_at: Optional[datetime]
    cancelled_at: Optional[datetime]
    cancellation_reason: Optional[str]
    created_at: datetime
    resource: Optional[ResourceResponse] = None

    class Config:
        from_attributes = True
