from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime
from app.db.session import Base
from app.models.base import UUIDPrimaryKeyMixin


class AuditEvent(Base, UUIDPrimaryKeyMixin):
    __tablename__ = "audit_events"

    entity_type = Column(String(100), nullable=False, index=True)  # incident, assignment, resource, shelter
    entity_id = Column(String(36), nullable=False, index=True)
    action = Column(String(100), nullable=False)  # status_change, assignment_dispatch, manual_override
    performed_by = Column(String(255), nullable=False)  # user email or ID
    changes_json = Column(Text, nullable=True)  # JSON representation of diff
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
