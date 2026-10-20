import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, Float, ForeignKey, DateTime, Enum as SAEnum
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


class IncidentStatusEnum(str, enum.Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class IncidentPriorityEnum(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Incident(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "incidents"

    reference_code = Column(String(50), unique=True, index=True, nullable=False)
    event_id = Column(String(36), ForeignKey("disaster_events.id"), nullable=True, index=True)

    # Reporter Details
    reporter_name = Column(String(255), nullable=False)
    reporter_contact = Column(String(100), nullable=False)
    reporter_is_victim = Column(Boolean, default=True, nullable=False)

    # Incident Details
    disaster_type = Column(String(50), default="flood", nullable=False)
    status = Column(SAEnum(IncidentStatusEnum), default=IncidentStatusEnum.SUBMITTED, nullable=False, index=True)
    priority = Column(SAEnum(IncidentPriorityEnum), default=IncidentPriorityEnum.MEDIUM, nullable=False, index=True)

    people_count = Column(Integer, default=1, nullable=False)
    trapped_count = Column(Integer, default=0, nullable=False)
    medical_assistance_needed = Column(Boolean, default=False, nullable=False)
    special_needs_description = Column(Text, nullable=True)
    description = Column(Text, nullable=False)

    # Location Details
    address_text = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    # PostGIS geometry point for spatial queries (SRID 4326: WGS84)
    geom = Column(Geometry("POINT", srid=4326), nullable=True)

    # AI-assisted recommendation metadata (Never autonomous; reviewable by human dispatcher)
    ai_triage_score = Column(Float, nullable=True)
    ai_suggested_priority = Column(String(50), nullable=True)
    ai_recommendation_notes = Column(Text, nullable=True)

    # Attachments S3 keys
    attachment_keys = Column(Text, nullable=True)  # JSON or comma-separated S3 object keys

    # Relationships
    event = relationship("DisasterEvent", back_populates="incidents")
    status_history = relationship("IncidentStatusHistory", back_populates="incident", cascade="all, delete-orphan", order_by="IncidentStatusHistory.created_at.desc()")
    assignments = relationship("ResourceAssignment", back_populates="incident", cascade="all, delete-orphan")


class IncidentStatusHistory(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "incident_status_history"

    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False, index=True)
    previous_status = Column(String(50), nullable=True)
    new_status = Column(String(50), nullable=False)
    changed_by_user_id = Column(String(36), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    incident = relationship("Incident", back_populates="status_history")
