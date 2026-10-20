from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.shelter import Shelter, ShelterCapacityRecord, ShelterStatusEnum
from app.repositories.base import BaseRepository


class ShelterRepository(BaseRepository[Shelter]):
    def __init__(self, db: Session):
        super().__init__(Shelter, db)

    def filter_shelters(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Shelter], int]:
        query = self.db.query(Shelter)
        if status:
            query = query.filter(Shelter.status == status)

        total_count = query.count()
        items = query.order_by(Shelter.name.asc()).offset(skip).limit(limit).all()
        return items, total_count

    def record_capacity_snapshot(self, shelter_id: str, occupancy: int, available_beds: int, notes: Optional[str] = None):
        record = ShelterCapacityRecord(
            shelter_id=shelter_id,
            occupancy_count=occupancy,
            available_beds=available_beds,
            notes=notes
        )
        self.db.add(record)
        self.db.commit()
        return record
