import json
from typing import Any, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent


class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def record_event(
        self,
        entity_type: str,
        entity_id: str,
        action: str,
        performed_by: str,
        changes: Optional[Any] = None,
        ip_address: Optional[str] = None
    ) -> AuditEvent:
        changes_str = json.dumps(changes) if changes else None
        event = AuditEvent(
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            performed_by=performed_by,
            changes_json=changes_str,
            ip_address=ip_address
        )
        self.db.add(event)
        self.db.commit()
        return event
