from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum
from app.models.resource import Resource, ResourceStatusEnum
from app.models.shelter import Shelter, ShelterStatusEnum
from app.schemas.dashboard import DashboardSummary
from app.schemas.incident import IncidentResponse


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_summary(self) -> DashboardSummary:
        # Incidents calculations
        total_incidents = self.db.query(func.count(Incident.id)).scalar() or 0

        active_statuses = [
            IncidentStatusEnum.SUBMITTED,
            IncidentStatusEnum.UNDER_REVIEW,
            IncidentStatusEnum.VERIFIED,
            IncidentStatusEnum.ASSIGNED,
            IncidentStatusEnum.IN_PROGRESS
        ]
        active_incidents = self.db.query(func.count(Incident.id)).filter(
            Incident.status.in_(active_statuses)
        ).scalar() or 0

        critical_incidents = self.db.query(func.count(Incident.id)).filter(
            Incident.priority == IncidentPriorityEnum.CRITICAL,
            Incident.status.in_(active_statuses)
        ).scalar() or 0

        resolved_incidents = self.db.query(func.count(Incident.id)).filter(
            Incident.status == IncidentStatusEnum.RESOLVED
        ).scalar() or 0

        # Resources calculations
        total_resources = self.db.query(func.count(Resource.id)).scalar() or 0
        available_resources = self.db.query(func.count(Resource.id)).filter(
            Resource.status == ResourceStatusEnum.AVAILABLE
        ).scalar() or 0
        deployed_resources = self.db.query(func.count(Resource.id)).filter(
            Resource.status == ResourceStatusEnum.DEPLOYED
        ).scalar() or 0

        # Shelters calculations
        shelter_total_capacity = self.db.query(func.sum(Shelter.capacity_total)).scalar() or 0
        shelter_current_occupancy = self.db.query(func.sum(Shelter.current_occupancy)).scalar() or 0
        shelter_available_beds = max(0, shelter_total_capacity - shelter_current_occupancy)

        occupancy_pct = (
            round((shelter_current_occupancy / shelter_total_capacity) * 100.0, 1)
            if shelter_total_capacity > 0 else 0.0
        )

        overcapacity_shelters_count = self.db.query(func.count(Shelter.id)).filter(
            Shelter.current_occupancy >= Shelter.capacity_total
        ).scalar() or 0

        # Unserved & bottleneck metrics
        # Critical incidents still waiting for assignment or dispatcher action
        unserved_critical_query = self.db.query(Incident).filter(
            Incident.priority == IncidentPriorityEnum.CRITICAL,
            Incident.status.in_([IncidentStatusEnum.SUBMITTED, IncidentStatusEnum.UNDER_REVIEW, IncidentStatusEnum.VERIFIED])
        )
        unserved_critical_needs_count = unserved_critical_query.count()

        unassigned_verified_incidents = self.db.query(func.count(Incident.id)).filter(
            Incident.status == IncidentStatusEnum.VERIFIED
        ).scalar() or 0

        critical_unserved_objs = unserved_critical_query.order_by(Incident.created_at.asc()).limit(10).all()
        critical_unserved_incidents = [IncidentResponse.model_validate(inc) for inc in critical_unserved_objs]

        # Breakdowns
        incidents_by_priority: Dict[str, int] = {}
        for row in self.db.query(Incident.priority, func.count(Incident.id)).group_by(Incident.priority).all():
            incidents_by_priority[str(row[0].value if hasattr(row[0], 'value') else row[0])] = row[1]

        incidents_by_status: Dict[str, int] = {}
        for row in self.db.query(Incident.status, func.count(Incident.id)).group_by(Incident.status).all():
            incidents_by_status[str(row[0].value if hasattr(row[0], 'value') else row[0])] = row[1]

        resources_by_type: Dict[str, int] = {}
        for row in self.db.query(Resource.resource_type, func.count(Resource.id)).group_by(Resource.resource_type).all():
            resources_by_type[str(row[0].value if hasattr(row[0], 'value') else row[0])] = row[1]

        return DashboardSummary(
            total_incidents=total_incidents,
            active_incidents=active_incidents,
            critical_incidents=critical_incidents,
            resolved_incidents=resolved_incidents,
            total_resources=total_resources,
            available_resources=available_resources,
            deployed_resources=deployed_resources,
            shelter_total_capacity=shelter_total_capacity,
            shelter_current_occupancy=shelter_current_occupancy,
            shelter_available_beds=shelter_available_beds,
            shelter_occupancy_pct=occupancy_pct,
            unserved_critical_needs_count=unserved_critical_needs_count,
            unassigned_verified_incidents=unassigned_verified_incidents,
            overcapacity_shelters_count=overcapacity_shelters_count,
            incidents_by_priority=incidents_by_priority,
            incidents_by_status=incidents_by_status,
            resources_by_type=resources_by_type,
            critical_unserved_incidents=critical_unserved_incidents
        )
