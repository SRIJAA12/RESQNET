from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.assignment import ResourceAssignment, AssignmentStatusEnum
from app.repositories.base import BaseRepository


class AssignmentRepository(BaseRepository[ResourceAssignment]):
    def __init__(self, db: Session):
        super().__init__(ResourceAssignment, db)

    def get_active_assignment_for_resource(self, resource_id: str) -> Optional[ResourceAssignment]:
        """
        Check if the resource is currently tied to an active assignment.
        Active statuses: PROPOSED, APPROVED, DISPATCHED.
        """
        active_statuses = [
            AssignmentStatusEnum.PROPOSED,
            AssignmentStatusEnum.APPROVED,
            AssignmentStatusEnum.DISPATCHED
        ]
        return self.db.query(ResourceAssignment).filter(
            ResourceAssignment.resource_id == resource_id,
            ResourceAssignment.status.in_(active_statuses)
        ).first()

    def list_by_incident(self, incident_id: str) -> List[ResourceAssignment]:
        return self.db.query(ResourceAssignment).filter(
            ResourceAssignment.incident_id == incident_id
        ).all()
