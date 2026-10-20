from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.event import DisasterEvent
from app.schemas.event import DisasterEventCreate
from app.repositories.event_repo import EventRepository


class EventService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = EventRepository(db)

    def create_event(self, data: DisasterEventCreate) -> DisasterEvent:
        event = DisasterEvent(
            name=data.name,
            disaster_type=data.disaster_type,
            status=data.status,
            severity=data.severity,
            description=data.description,
            declaration_date=data.declaration_date,
            affected_region_name=data.affected_region_name,
            affected_region_geojson=data.affected_region_geojson,
        )
        return self.repo.create(event)

    def list_events(self, active_only: bool = False) -> List[DisasterEvent]:
        if active_only:
            return self.repo.list_active()
        return self.repo.list_all()

    def get_event(self, event_id: str) -> Optional[DisasterEvent]:
        return self.repo.get_by_id(event_id)
