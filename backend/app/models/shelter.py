import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, ForeignKey, DateTime, Enum as SAEnum
)
from sqlalchemy.orm import relationship
try:
    from geoalchemy2 import Geometry
except ImportError:
    from sqlalchemy.types import UserDefinedType
    class Geometry(UserDefinedType):  # type: ignore
        def __init__(self, *args, **kwargs):
            pass
        def get_col_spec(self, **kw):
            return "GEOMETRY"

from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin


class ShelterStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    FULL = "full"
    CLOSED = "closed"


class Shelter(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "shelters"

    name = Column(String(255), nullable=False, index=True)
    status = Column(SAEnum(ShelterStatusEnum), default=ShelterStatusEnum.ACTIVE, nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True)

    address = Column(String(500), nullable=False)
    contact_phone = Column(String(50), nullable=True)
    manager_name = Column(String(255), nullable=True)

    # Capacity
    capacity_total = Column(Integer, default=100, nullable=False)
    current_occupancy = Column(Integer, default=0, nullable=False)

    # Amenities & Preparedness
    medical_facilities_available = Column(Boolean, default=False, nullable=False)
    generator_backup = Column(Boolean, default=True, nullable=False)
    pet_friendly = Column(Boolean, default=False, nullable=False)
    water_purification_capacity_liters = Column(Integer, default=1000, nullable=False)

    # Spatial Coordinates
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    geom = Column(Geometry("POINT", srid=4326), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="shelters")
    capacity_records = relationship("ShelterCapacityRecord", back_populates="shelter", cascade="all, delete-orphan", order_by="ShelterCapacityRecord.recorded_at.desc()")
    inventory_items = relationship("InventoryItem", back_populates="shelter", cascade="all, delete-orphan")

    @property
    def available_beds(self) -> int:
        return max(0, self.capacity_total - self.current_occupancy)


class ShelterCapacityRecord(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "shelter_capacity_records"

    shelter_id = Column(String(36), ForeignKey("shelters.id"), nullable=False, index=True)
    occupancy_count = Column(Integer, nullable=False)
    available_beds = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    shelter = relationship("Shelter", back_populates="capacity_records")
