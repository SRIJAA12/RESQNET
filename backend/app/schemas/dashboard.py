from typing import Dict, List, Optional
from pydantic import BaseModel
from app.schemas.incident import IncidentResponse


class DashboardSummary(BaseModel):
    # Incidents metrics
    total_incidents: int
    active_incidents: int
    critical_incidents: int
    resolved_incidents: int

    # Resources metrics
    total_resources: int
    available_resources: int
    deployed_resources: int

    # Shelters metrics
    shelter_total_capacity: int
    shelter_current_occupancy: int
    shelter_available_beds: int
    shelter_occupancy_pct: float

    # Unserved & bottleneck alerts
    unserved_critical_needs_count: int
    unassigned_verified_incidents: int
    overcapacity_shelters_count: int

    # Breakdowns
    incidents_by_priority: Dict[str, int]
    incidents_by_status: Dict[str, int]
    resources_by_type: Dict[str, int]

    # Sample critical bottlenecks for immediate dispatcher review
    critical_unserved_incidents: List[IncidentResponse] = []
