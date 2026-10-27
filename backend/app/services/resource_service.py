from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.resource import Resource, ResourceStatusEnum
from app.schemas.resource import ResourceCreate
from app.repositories.resource_repo import ResourceRepository
from app.repositories.audit_repo import AuditRepository


class ResourceService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ResourceRepository(db)
        self.audit_repo = AuditRepository(db)

    def create_resource(self, data: ResourceCreate, creator_email: str = "system") -> Resource:
        wkt_geom = f"SRID=4326;POINT({data.longitude} {data.latitude})"

        resource = Resource(
            name=data.name,
            resource_type=data.resource_type,
            status=data.status,
            organization_id=data.organization_id,
            passenger_capacity=data.passenger_capacity,
            crew_count=data.crew_count,
            battery_or_fuel_pct=data.battery_or_fuel_pct,
            operational_notes=data.operational_notes,
            contact_phone=data.contact_phone,
            responder_lead_name=data.responder_lead_name,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=wkt_geom,
        )
        saved = self.repo.create(resource)

        self.audit_repo.record_event(
            entity_type="resource",
            entity_id=saved.id,
            action="resource_registered",
            performed_by=creator_email,
            changes={"name": saved.name, "type": saved.resource_type.value}
        )
        return saved

    def list_resources(
        self,
        status: Optional[str] = None,
        resource_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Resource], int]:
        skip = (page - 1) * page_size
        return self.repo.filter_resources(
            status=status,
            resource_type=resource_type,
            skip=skip,
            limit=page_size
        )

    def get_resource(self, resource_id: str) -> Optional[Resource]:
        return self.repo.get_by_id(resource_id)

    def get_available_resources(self) -> List[Resource]:
        return self.repo.get_available_resources()

    def update_resource_status(
        self,
        resource_id: str,
        new_status: ResourceStatusEnum,
        operational_notes: Optional[str] = None,
        updated_by: str = "dispatcher"
    ) -> Optional[Resource]:
        resource = self.repo.get_by_id(resource_id)
        if not resource:
            return None
        prev_status = resource.status.value
        resource.status = new_status
        if operational_notes:
            resource.operational_notes = (
                f"{resource.operational_notes} | {operational_notes}"
                if resource.operational_notes else operational_notes
            )
        self.db.commit()
        self.db.refresh(resource)

        self.audit_repo.record_event(
            entity_type="resource",
            entity_id=resource.id,
            action="resource_status_updated",
            performed_by=updated_by,
            changes={"previous_status": prev_status, "new_status": new_status.value}
        )
        return resource
