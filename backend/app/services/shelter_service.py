from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.models.shelter import Shelter, ShelterStatusEnum
from app.schemas.shelter import ShelterCreate, ShelterUpdate
from app.repositories.shelter_repo import ShelterRepository
from app.repositories.audit_repo import AuditRepository


class ShelterService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = ShelterRepository(db)
        self.audit_repo = AuditRepository(db)

    def create_shelter(self, data: ShelterCreate, creator_email: str = "system") -> Shelter:
        wkt_geom = f"SRID=4326;POINT({data.longitude} {data.latitude})"

        shelter = Shelter(
            name=data.name,
            status=data.status,
            organization_id=data.organization_id,
            address=data.address,
            contact_phone=data.contact_phone,
            manager_name=data.manager_name,
            capacity_total=data.capacity_total,
            current_occupancy=data.current_occupancy,
            medical_facilities_available=data.medical_facilities_available,
            generator_backup=data.generator_backup,
            pet_friendly=data.pet_friendly,
            water_purification_capacity_liters=data.water_purification_capacity_liters,
            latitude=data.latitude,
            longitude=data.longitude,
            geom=wkt_geom
        )
        saved = self.repo.create(shelter)

        # Snapshot initial capacity
        self.repo.record_capacity_snapshot(
            shelter_id=saved.id,
            occupancy=saved.current_occupancy,
            available_beds=saved.available_beds,
            notes="Initial shelter registration"
        )

        self.audit_repo.record_event(
            entity_type="shelter",
            entity_id=saved.id,
            action="shelter_registered",
            performed_by=creator_email,
            changes={"name": saved.name, "capacity_total": saved.capacity_total}
        )
        return saved

    def list_shelters(
        self,
        status: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Shelter], int]:
        skip = (page - 1) * page_size
        return self.repo.filter_shelters(status=status, skip=skip, limit=page_size)

    def get_shelter(self, shelter_id: str) -> Optional[Shelter]:
        return self.repo.get_by_id(shelter_id)

    def update_shelter(self, shelter_id: str, update: ShelterUpdate, user_email: str = "dispatcher") -> Optional[Shelter]:
        shelter = self.repo.get_by_id(shelter_id)
        if not shelter:
            return None

        if update.capacity_total is not None:
            shelter.capacity_total = update.capacity_total
        if update.current_occupancy is not None:
            shelter.current_occupancy = update.current_occupancy
            if shelter.current_occupancy >= shelter.capacity_total:
                shelter.status = ShelterStatusEnum.FULL
            elif shelter.status == ShelterStatusEnum.FULL and shelter.current_occupancy < shelter.capacity_total:
                shelter.status = ShelterStatusEnum.ACTIVE

        if update.status is not None:
            shelter.status = update.status

        updated = self.repo.update(shelter)

        # Record snapshot
        self.repo.record_capacity_snapshot(
            shelter_id=shelter.id,
            occupancy=shelter.current_occupancy,
            available_beds=shelter.available_beds,
            notes=update.notes
        )

        self.audit_repo.record_event(
            entity_type="shelter",
            entity_id=shelter.id,
            action="capacity_updated",
            performed_by=user_email,
            changes={"current_occupancy": shelter.current_occupancy, "status": shelter.status.value}
        )
        return updated
