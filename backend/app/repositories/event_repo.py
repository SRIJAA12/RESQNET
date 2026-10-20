from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.event import DisasterEvent, EventStatusEnum
from app.repositories.base import BaseRepository


class EventRepository(BaseRepository[DisasterEvent]):
    def __init__(self, db: Session):
        super().__init__(DisasterEvent, db)

    def list_active(self) -> List[DisasterEvent]:
        return self.db.query(DisasterEvent).filter(DisasterEvent.status == EventStatusEnum.ACTIVE).all()
