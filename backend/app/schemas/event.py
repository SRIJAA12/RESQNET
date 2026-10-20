from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.event import DisasterTypeEnum, EventStatusEnum, DisasterSeverityEnum


class DisasterEventBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=255)
    disaster_type: DisasterTypeEnum = DisasterTypeEnum.FLOOD
    status: EventStatusEnum = EventStatusEnum.ACTIVE
    severity: DisasterSeverityEnum = DisasterSeverityEnum.SEVERE
    description: Optional[str] = None
    affected_region_name: str = Field(..., min_length=2, max_length=255)
    affected_region_geojson: Optional[str] = None


class DisasterEventCreate(DisasterEventBase):
    declaration_date: Optional[datetime] = None


class DisasterEventResponse(DisasterEventBase):
    id: str
    declaration_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
