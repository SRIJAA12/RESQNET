from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.shelter import ShelterStatusEnum


class ShelterBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    status: ShelterStatusEnum = ShelterStatusEnum.ACTIVE
    organization_id: Optional[str] = None
    address: str = Field(..., min_length=5, max_length=500)
    contact_phone: Optional[str] = None
    manager_name: Optional[str] = None
    capacity_total: int = Field(default=100, ge=1)
    current_occupancy: int = Field(default=0, ge=0)
    medical_facilities_available: bool = False
    generator_backup: bool = True
    pet_friendly: bool = False
    water_purification_capacity_liters: int = Field(default=1000, ge=0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)


class ShelterCreate(ShelterBase):
    pass


class ShelterUpdate(BaseModel):
    status: Optional[ShelterStatusEnum] = None
    current_occupancy: Optional[int] = Field(None, ge=0)
    capacity_total: Optional[int] = Field(None, ge=1)
    notes: Optional[str] = None


class ShelterResponse(ShelterBase):
    id: str
    available_beds: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
