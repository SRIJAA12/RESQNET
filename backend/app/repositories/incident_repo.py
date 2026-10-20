from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.incident import Incident, IncidentStatusHistory, IncidentStatusEnum, IncidentPriorityEnum
from app.repositories.base import BaseRepository


class IncidentRepository(BaseRepository[Incident]):
    def __init__(self, db: Session):
        super().__init__(Incident, db)

    def get_by_reference(self, reference_code: str) -> Optional[Incident]:
        return self.db.query(Incident).filter(Incident.reference_code == reference_code).first()

    def filter_incidents(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        event_id: Optional[str] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Incident], int]:
        query = self.db.query(Incident)

        if status:
            query = query.filter(Incident.status == status)
        if priority:
            query = query.filter(Incident.priority == priority)
        if event_id:
            query = query.filter(Incident.event_id == event_id)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Incident.reference_code.ilike(search_pattern)) |
                (Incident.address_text.ilike(search_pattern)) |
                (Incident.description.ilike(search_pattern)) |
                (Incident.reporter_name.ilike(search_pattern))
            )

        total_count = query.count()
        items = query.order_by(
            # Sort by critical priority first, then latest created
            Incident.created_at.desc()
        ).offset(skip).limit(limit).all()

        return items, total_count

    def add_status_history(
        self,
        incident_id: str,
        previous_status: Optional[str],
        new_status: str,
        changed_by_user_id: Optional[str] = None,
        notes: Optional[str] = None
    ) -> IncidentStatusHistory:
        history = IncidentStatusHistory(
            incident_id=incident_id,
            previous_status=previous_status,
            new_status=new_status,
            changed_by_user_id=changed_by_user_id,
            notes=notes
        )
        self.db.add(history)
        self.db.commit()
        return history
