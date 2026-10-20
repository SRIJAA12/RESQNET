from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.resource import ResourceTypeEnum, ResourceStatusEnum


class ResourceBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    resource_type: ResourceTypeEnum
    status: ResourceStatusEnum = ResourceStatusEnum.AVAILABLE
    organization_id: Optional[str] = None
    passenger_capacity: int = Field(default=0, ge=0)
    crew_count: int = Field(default=1, ge=1)
    battery_or_fuel_pct: int = Field(default=100, ge=0, le=100)
    operational_notes: Optional[str] = None
    contact_phone: Optional[str] = None
    responder_lead_name: Optional[str] = None
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
