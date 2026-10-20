import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, ForeignKey, DateTime, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin, TimestampMixin


class AssignmentStatusEnum(str, enum.Enum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    DISPATCHED = "dispatched"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ResourceAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "resource_assignments"

    incident_id = Column(String(36), ForeignKey("incidents.id"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("resources.id"), nullable=False, index=True)

    status = Column(SAEnum(AssignmentStatusEnum), default=AssignmentStatusEnum.PROPOSED, nullable=False, index=True)

    # Dispatcher accountability (Never automatic AI approval)
    assigned_by_user_id = Column(String(36), nullable=True)
    dispatcher_notes = Column(Text, nullable=True)

    # Operational lifecycle timestamps
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Relationships
    incident = relationship("Incident", back_populates="assignments")
    resource = relationship("Resource", back_populates="assignments")
