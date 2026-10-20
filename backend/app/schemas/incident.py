from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.incident import IncidentStatusEnum, IncidentPriorityEnum


class IncidentStatusHistoryResponse(BaseModel):
    id: str
    previous_status: Optional[str]
    new_status: str
    changed_by_user_id: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class IncidentCreate(BaseModel):
    reporter_name: str = Field(..., min_length=2, max_length=255)
    reporter_contact: str = Field(..., min_length=5, max_length=100)
    reporter_is_victim: bool = True

    disaster_type: str = Field(default="flood")
    people_count: int = Field(default=1, ge=1, le=500)
    trapped_count: int = Field(default=0, ge=0, le=500)
    medical_assistance_needed: bool = False
    special_needs_description: Optional[str] = None
    description: str = Field(..., min_length=10, max_length=3000)

    address_text: str = Field(..., min_length=5, max_length=500)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    event_id: Optional[str] = None


class IncidentStatusUpdate(BaseModel):
    status: IncidentStatusEnum
    notes: Optional[str] = Field(None, max_length=1000)


class IncidentResponse(BaseModel):
    id: str
    reference_code: str
    event_id: Optional[str]
    reporter_name: str
    reporter_contact: str
    reporter_is_victim: bool

    disaster_type: str
    status: IncidentStatusEnum
    priority: IncidentPriorityEnum

    people_count: int
    trapped_count: int
    medical_assistance_needed: bool
    special_needs_description: Optional[str]
    description: str

    address_text: str
    latitude: float
    longitude: float

    ai_triage_score: Optional[float] = None
    ai_suggested_priority: Optional[str] = None
    ai_recommendation_notes: Optional[str] = None

    created_at: datetime
    updated_at: datetime
    status_history: List[IncidentStatusHistoryResponse] = []

    class Config:
        from_attributes = True
