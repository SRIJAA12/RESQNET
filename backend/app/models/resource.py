import enum
from sqlalchemy import (
    Column, String, Text, Integer, Float, ForeignKey, Enum as SAEnum, Boolean
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


class ResourceTypeEnum(str, enum.Enum):
    BOAT = "boat"
    AMBULANCE = "ambulance"
    DRONE = "drone"
    EVACUATION_TRUCK = "evacuation_truck"
    MEDICAL_TEAM = "medical_team"
    FOOD_WATER_PACK = "food_water_pack"


class ResourceStatusEnum(str, enum.Enum):
    AVAILABLE = "available"
    DEPLOYED = "deployed"
    MAINTENANCE = "maintenance"
    DECOMMISSIONED = "decommissioned"


class Resource(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "resources"

    name = Column(String(255), nullable=False, index=True)
    resource_type = Column(SAEnum(ResourceTypeEnum), nullable=False, index=True)
    status = Column(SAEnum(ResourceStatusEnum), default=ResourceStatusEnum.AVAILABLE, nullable=False, index=True)
    organization_id = Column(String(36), ForeignKey("organizations.id"), nullable=True, index=True)

    # Operational specifications (capacity, fuel/battery level, crew size)
    passenger_capacity = Column(Integer, default=0, nullable=False)
    crew_count = Column(Integer, default=1, nullable=False)
    battery_or_fuel_pct = Column(Integer, default=100, nullable=False)
    operational_notes = Column(Text, nullable=True)

    # Contact & Tracking
    contact_phone = Column(String(50), nullable=True)
    responder_lead_name = Column(String(255), nullable=True)

    # Current Location
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    geom = Column(Geometry("POINT", srid=4326), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="resources")
    assignments = relationship("ResourceAssignment", back_populates="resource", cascade="all, delete-orphan")
