import enum
from sqlalchemy import Column, String, Text, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin


class DisasterTypeEnum(str, enum.Enum):
    FLOOD = "flood"
    CYCLONE = "cyclone"
    LANDSLIDE = "landslide"
    HEATWAVE = "heatwave"
    EARTHQUAKE = "earthquake"
    OTHER = "other"


class EventStatusEnum(str, enum.Enum):
    MONITORING = "monitoring"
    ACTIVE = "active"
    CONTAINED = "contained"
    RESOLVED = "resolved"


class DisasterSeverityEnum(str, enum.Enum):
    MINOR = "minor"
    MODERATE = "moderate"
    SEVERE = "severe"
    CATASTROPHIC = "catastrophic"


class DisasterEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "disaster_events"

    name = Column(String(255), nullable=False, index=True)
    disaster_type = Column(SAEnum(DisasterTypeEnum), default=DisasterTypeEnum.FLOOD, nullable=False, index=True)
    status = Column(SAEnum(EventStatusEnum), default=EventStatusEnum.ACTIVE, nullable=False, index=True)
    severity = Column(SAEnum(DisasterSeverityEnum), default=DisasterSeverityEnum.SEVERE, nullable=False)
    description = Column(Text, nullable=True)
    declaration_date = Column(DateTime(timezone=True), nullable=True)
    affected_region_name = Column(String(255), nullable=False)
    affected_region_geojson = Column(Text, nullable=True)  # GeoJSON polygon or multi-polygon

    incidents = relationship("Incident", back_populates="event", cascade="all, delete-orphan")
