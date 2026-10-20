from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.resource import Resource, ResourceStatusEnum, ResourceTypeEnum
from app.repositories.base import BaseRepository


class ResourceRepository(BaseRepository[Resource]):
    def __init__(self, db: Session):
        super().__init__(Resource, db)

    def filter_resources(
        self,
        status: Optional[str] = None,
        resource_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> Tuple[List[Resource], int]:
        query = self.db.query(Resource)

        if status:
            query = query.filter(Resource.status == status)
        if resource_type:
            query = query.filter(Resource.resource_type == resource_type)

        total_count = query.count()
        items = query.order_by(Resource.name.asc()).offset(skip).limit(limit).all()
        return items, total_count

    def get_available_resources(self) -> List[Resource]:
        return self.db.query(Resource).filter(Resource.status == ResourceStatusEnum.AVAILABLE).all()
