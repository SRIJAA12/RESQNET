"""
Synthetic Flood-Response Demonstration Data Seeder for RESQNET.
CRITICAL NOTICE: All records, phone numbers, names, locations and incidents
generated here are 100% FICTIONAL and for simulation/demonstration purposes only.
"""
from datetime import datetime, timezone, timedelta
from app.db.session import SessionLocal, Base, engine
from app.models.event import DisasterEvent, DisasterTypeEnum, EventStatusEnum, DisasterSeverityEnum
from app.models.user import Organization, OrgTypeEnum, User, UserProfile, UserRoleEnum
from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum, IncidentStatusHistory
from app.models.resource import Resource, ResourceTypeEnum, ResourceStatusEnum
from app.models.assignment import ResourceAssignment, AssignmentStatusEnum
from app.models.shelter import Shelter, ShelterCapacityRecord, ShelterStatusEnum
from app.models.inventory import InventoryItem, InventoryMovement, ItemCategoryEnum, MovementTypeEnum
from app.models.audit import AuditEvent


def seed_database():
    db = SessionLocal()
    try:
        # Create schema if not yet created
        Base.metadata.create_all(bind=engine)

        # Check if already seeded
        existing_event = db.query(DisasterEvent).filter(DisasterEvent.name.like("%Riverbend%")).first()
        if existing_event:
            print("[INFO] Database already contains seed data. Skipping duplicate seed.")
            return

        print("[INFO] Seeding synthetic disaster scenario: Riverbend Metro Flood Response...")

        # 1. Organizations
        org_ndrd = Organization(
            name="National Disaster Response Force (Sector Alpha)",
            org_type=OrgTypeEnum.GOVERNMENT,
            contact_email="dispatch-alpha@ndrd.simulated.gov",
            contact_phone="555-019-4820",
            address="Building 4, Riverbend Emergency Complex",
            is_verified=True
        )
        org_ngo = Organization(
            name="Flood Relief NGO Alliance",
            org_type=OrgTypeEnum.NGO,
            contact_email="relief@floodalliance.simulated.org",
            contact_phone="555-019-3311",
            address="12 Aid Road, Safe Zone North",
            is_verified=True
        )
        org_medical = Organization(
            name="Metro Rapid Emergency Paramedics",
            org_type=OrgTypeEnum.HOSPITAL,
            contact_email="trauma@metromed.simulated.org",
            contact_phone="555-019-9110",
            address="88 Health Parkway, Riverbend Central",
            is_verified=True
        )
        db.add_all([org_ndrd, org_ngo, org_medical])
        db.commit()

        # 2. Disaster Event
        event_date = datetime.now(timezone.utc) - timedelta(hours=14)
        event = DisasterEvent(
            name="Riverbend Metro Flash Flood & River Overflow (Simulated)",
            disaster_type=DisasterTypeEnum.FLOOD,
            status=EventStatusEnum.ACTIVE,
            severity=DisasterSeverityEnum.SEVERE,
            declaration_date=event_date,
            affected_region_name="Riverbend Valley - Sectors A, B, and Delta Basin",
            description=(
                "SIMULATION EXERCISE: Heavy torrential rainfall exceeding 240mm in 12 hours "
                "caused the Riverbend tributary to breach retaining dikes at Sector B and Delta Basin. "
                "Simulated operations active."
            )
        )
        db.add(event)
        db.commit()

        # 3. Resources / Fleets
        r1 = Resource(
            name="Rescue Boat Swift-Alpha 01",
            resource_type=ResourceTypeEnum.BOAT,
            status=ResourceStatusEnum.AVAILABLE,
            organization_id=org_ndrd.id,
            passenger_capacity=8,
            crew_count=3,
            battery_or_fuel_pct=92,
            operational_notes="Rigid inflatable rescue craft with night searchlights and 40hp outboard.",
            contact_phone="555-011-8801",
            responder_lead_name="Commander R. Evans (Simulated)",
            latitude=28.5820,
            longitude=77.2180,
            geom="SRID=4326;POINT(77.2180 28.5820)"
        )
        r2 = Resource(
            name="Rescue Boat Swift-Delta 02",
            resource_type=ResourceTypeEnum.BOAT,
            status=ResourceStatusEnum.DEPLOYED,
            organization_id=org_ndrd.id,
            passenger_capacity=10,
            crew_count=4,
            battery_or_fuel_pct=76,
            operational_notes="Heavy shallow-draft aluminum flood boat equipped with thermal imager.",
            contact_phone="555-011-8802",
            responder_lead_name="Capt. M. Chen (Simulated)",
            latitude=28.5670,
            longitude=77.2450,
            geom="SRID=4326;POINT(77.2450 28.5670)"
        )
        r3 = Resource(
            name="High-Water Evacuation Truck Heavy-04",
            resource_type=ResourceTypeEnum.EVACUATION_TRUCK,
            status=ResourceStatusEnum.DEPLOYED,
            organization_id=org_ndrd.id,
            passenger_capacity=24,
            crew_count=2,
            battery_or_fuel_pct=81,
            operational_notes="6x6 military transport vehicle with 1.4m fording depth capability.",
            contact_phone="555-011-8804",
            responder_lead_name="Sergeant K. Patel (Simulated)",
            latitude=28.5990,
            longitude=77.2020,
            geom="SRID=4326;POINT(77.2020 28.5990)"
        )
        r4 = Resource(
            name="Rapid Paramedic Ambulance Medic-12",
            resource_type=ResourceTypeEnum.AMBULANCE,
            status=ResourceStatusEnum.AVAILABLE,
            organization_id=org_medical.id,
            passenger_capacity=3,
            crew_count=2,
            battery_or_fuel_pct=96,
            operational_notes="Equipped with advanced life support (ALS), ventilators, and hypothermia warming units.",
            contact_phone="555-011-9912",
            responder_lead_name="Dr. S. Nair (Simulated)",
            latitude=28.5510,
            longitude=77.2290,
            geom="SRID=4326;POINT(77.2290 28.5510)"
        )
        r5 = Resource(
            name="Aerial Reconnaissance Drone Hawk-Eye 03",
            resource_type=ResourceTypeEnum.DRONE,
            status=ResourceStatusEnum.AVAILABLE,
            organization_id=org_ngo.id,
            passenger_capacity=0,
            crew_count=1,
            battery_or_fuel_pct=88,
            operational_notes="Thermal IR quadcopter with high-resolution flood mapping telemetry.",
            contact_phone="555-011-5503",
            responder_lead_name="Pilot T. Weber (Simulated)",
            latitude=28.5740,
            longitude=77.2340,
            geom="SRID=4326;POINT(77.2340 28.5740)"
        )
        db.add_all([r1, r2, r3, r4, r5])
        db.commit()

        # 4. Shelters
        s1 = Shelter(
            name="St. Jude Community Relief Center",
            status=ShelterStatusEnum.ACTIVE,
            organization_id=org_ngo.id,
            address="14 Hope Crescent, Riverbend Heights",
            contact_phone="555-014-9901",
            manager_name="Grace Hopper (Simulated)",
            capacity_total=250,
            current_occupancy=195,
            medical_facilities_available=True,
            generator_backup=True,
            pet_friendly=True,
            water_purification_capacity_liters=4000,
            latitude=28.6050,
            longitude=77.2080,
            geom="SRID=4326;POINT(77.2080 28.6050)"
        )
        s2 = Shelter(
            name="Riverside Polytechnic Gymnasium",
            status=ShelterStatusEnum.FULL,
            organization_id=org_ndrd.id,
            address="102 Campus Drive, North Riverbend",
            contact_phone="555-014-9902",
            manager_name="David Miller (Simulated)",
            capacity_total=400,
            current_occupancy=395,
            medical_facilities_available=True,
            generator_backup=True,
            pet_friendly=False,
            water_purification_capacity_liters=8000,
            latitude=28.6180,
            longitude=77.2210,
            geom="SRID=4326;POINT(77.2210 28.6180)"
        )
        s3 = Shelter(
            name="Sector 4 Civic Convention Hall",
            status=ShelterStatusEnum.ACTIVE,
            organization_id=org_ngo.id,
            address="88 Exhibition Way, East Riverbend",
            contact_phone="555-014-9903",
            manager_name="Alicia Gomez (Simulated)",
            capacity_total=500,
            current_occupancy=210,
            medical_facilities_available=False,
            generator_backup=True,
            pet_friendly=True,
            water_purification_capacity_liters=10000,
            latitude=28.5480,
            longitude=77.2510,
            geom="SRID=4326;POINT(77.2510 28.5480)"
        )
        db.add_all([s1, s2, s3])
        db.commit()

        # Shelter initial capacity records
        for s in [s1, s2, s3]:
            db.add(ShelterCapacityRecord(
                shelter_id=s.id,
                occupancy_count=s.current_occupancy,
                available_beds=s.available_beds,
                notes="Morning status check"
            ))
        db.commit()

        # 5. Inventory Items
        inv1 = InventoryItem(
            shelter_id=s1.id,
            item_name="Packaged Drinking Water (20L Jerrycans)",
            category=ItemCategoryEnum.WATER,
            quantity=180,
            unit="cans",
            reorder_threshold=50
        )
        inv2 = InventoryItem(
            shelter_id=s1.id,
            item_name="Emergency Dry Ration Family Packs",
            category=ItemCategoryEnum.DRY_RATION,
            quantity=240,
            unit="packs",
            reorder_threshold=60
        )
        inv3 = InventoryItem(
            shelter_id=s2.id,
            item_name="Emergency Trauma & Suture Kits",
            category=ItemCategoryEnum.MEDICAL_KIT,
            quantity=15,
            unit="kits",
            reorder_threshold=25  # Needs restock alert!
        )
        db.add_all([inv1, inv2, inv3])
        db.commit()

        # 6. Incidents (Simulated Flooding SOS)
        inc1 = Incident(
            reference_code="SOS-2026-FLOOD-8492",
            event_id=event.id,
            reporter_name="Sunita Sharma (Simulated)",
            reporter_contact="555-017-9141",
            reporter_is_victim=True,
            disaster_type="flood",
            status=IncidentStatusEnum.UNDER_REVIEW,
            priority=IncidentPriorityEnum.CRITICAL,
            people_count=3,
            trapped_count=3,
            medical_assistance_needed=True,
            special_needs_description="Elderly diabetic grandmother with high fever. Water entered 1st floor.",
            description="Water is 1.8m deep and rising rapidly. Trapped on rooftop with no clean water or insulin.",
            address_text="Plot 42, River Creek Colony, Sector B",
            latitude=28.5710,
            longitude=77.2390,
            geom="SRID=4326;POINT(77.2390 28.5710)",
            ai_triage_score=85.0,
            ai_suggested_priority="critical",
            ai_recommendation_notes="AI Triage Score: 85.0/100 -> CRITICAL. Trapped above water, medical assistance urgent.",
            created_at=datetime.now(timezone.utc) - timedelta(hours=3, minutes=20)
        )

        inc2 = Incident(
            reference_code="SOS-2026-FLOOD-8493",
            event_id=event.id,
            reporter_name="Marcus Vance (Simulated)",
            reporter_contact="555-017-4322",
            reporter_is_victim=True,
            disaster_type="flood",
            status=IncidentStatusEnum.VERIFIED,
            priority=IncidentPriorityEnum.CRITICAL,
            people_count=5,
            trapped_count=5,
            medical_assistance_needed=False,
            special_needs_description="Two infants (8 months and 2 years old) stranded.",
            description="Ground floor submerged. Stranded on 2nd-floor balcony with 2 babies. Need boat rescue.",
            address_text="Flat 204, Green Oasis Apartments, Delta Sector",
            latitude=28.5630,
            longitude=77.2480,
            geom="SRID=4326;POINT(77.2480 28.5630)",
            ai_triage_score=75.0,
            ai_suggested_priority="critical",
            ai_recommendation_notes="AI Triage Score: 75.0/100 -> CRITICAL. Infants present, boat evacuation required.",
            created_at=datetime.now(timezone.utc) - timedelta(hours=2, minutes=10)
        )

        inc3 = Incident(
            reference_code="SOS-2026-FLOOD-8494",
            event_id=event.id,
            reporter_name="Dr. Ananya Roy (Simulated)",
            reporter_contact="555-017-1002",
            reporter_is_victim=False,
            disaster_type="flood",
            status=IncidentStatusEnum.IN_PROGRESS,
            priority=IncidentPriorityEnum.HIGH,
            people_count=14,
            trapped_count=0,
            medical_assistance_needed=True,
            special_needs_description="Dialysis patients awaiting emergency transit.",
            description="Clinic emergency power generators threatened by rising water. 14 patients require transfer to higher ground.",
            address_text="Lifeline Health Clinic, Low-Lying Industrial Area",
            latitude=28.5910,
            longitude=77.2110,
            geom="SRID=4326;POINT(77.2110 28.5910)",
            ai_triage_score=68.0,
            ai_suggested_priority="high",
            ai_recommendation_notes="AI Triage Score: 68.0/100 -> HIGH. Medical vulnerability transfer.",
            created_at=datetime.now(timezone.utc) - timedelta(hours=4)
        )

        inc4 = Incident(
            reference_code="SOS-2026-FLOOD-8495",
            event_id=event.id,
            reporter_name="Pooja Verma (Simulated)",
            reporter_contact="555-017-7788",
            reporter_is_victim=True,
            disaster_type="flood",
            status=IncidentStatusEnum.SUBMITTED,
            priority=IncidentPriorityEnum.MEDIUM,
            people_count=4,
            trapped_count=0,
            medical_assistance_needed=False,
            special_needs_description=None,
            description="Road surrounded by water. Supplies running low, elderly father safely upstairs but need evacuation plan.",
            address_text="House 19, Lane 3, South Ridge Colony",
            latitude=28.5420,
            longitude=77.2610,
            geom="SRID=4326;POINT(77.2610 28.5420)",
            ai_triage_score=35.0,
            ai_suggested_priority="medium",
            ai_recommendation_notes="AI Triage Score: 35.0/100 -> MEDIUM. Pre-evacuation planning.",
            created_at=datetime.now(timezone.utc) - timedelta(minutes=45)
        )

        inc5 = Incident(
            reference_code="SOS-2026-FLOOD-8490",
            event_id=event.id,
            reporter_name="Officer J. Blake (Simulated)",
            reporter_contact="555-017-2299",
            reporter_is_victim=False,
            disaster_type="flood",
            status=IncidentStatusEnum.RESOLVED,
            priority=IncidentPriorityEnum.MEDIUM,
            people_count=18,
            trapped_count=0,
            medical_assistance_needed=False,
            special_needs_description="School shelter group",
            description="Successful rescue of 18 children and staff from inundated primary school hall. All arrived safely at Sector 4 Civic Hall.",
            address_text="Primary School Compound, River Valley Road",
            latitude=28.6010,
            longitude=77.2310,
            geom="SRID=4326;POINT(77.2310 28.6010)",
            ai_triage_score=40.0,
            ai_suggested_priority="medium",
            ai_recommendation_notes="AI Triage Score: 40.0/100. Verification complete.",
            created_at=datetime.now(timezone.utc) - timedelta(hours=9)
        )

        db.add_all([inc1, inc2, inc3, inc4, inc5])
        db.commit()

        # 7. Incident History Entries
        db.add(IncidentStatusHistory(
            incident_id=inc1.id,
            previous_status=None,
            new_status="submitted",
            notes="Citizen reported via mobile SOS web app",
            created_at=inc1.created_at
        ))
        db.add(IncidentStatusHistory(
            incident_id=inc1.id,
            previous_status="submitted",
            new_status="under_review",
            notes="Dispatcher Triage: Flagged as critical due to medical urgency & trapped status",
            created_at=inc1.created_at + timedelta(minutes=15)
        ))

        db.add(IncidentStatusHistory(
            incident_id=inc3.id,
            previous_status="verified",
            new_status="in_progress",
            notes="Assigned to Heavy Truck Heavy-04 and Rescue Boat Swift-Delta 02",
            created_at=inc3.created_at + timedelta(minutes=30)
        ))

        # 8. Active Assignments
        asgn1 = ResourceAssignment(
            incident_id=inc3.id,
            resource_id=r2.id,
            status=AssignmentStatusEnum.DISPATCHED,
            assigned_by_user_id="00000000-0000-0000-0000-000000000001",
            dispatcher_notes="Dispatched to assist clinic patient transfer. Prioritize oxygen patients.",
            dispatched_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=30)
        )
        asgn2 = ResourceAssignment(
            incident_id=inc3.id,
            resource_id=r3.id,
            status=AssignmentStatusEnum.DISPATCHED,
            assigned_by_user_id="00000000-0000-0000-0000-000000000001",
            dispatcher_notes="High-water truck escorting boat trailer through flooded highway.",
            dispatched_at=datetime.now(timezone.utc) - timedelta(hours=1, minutes=30)
        )
        db.add_all([asgn1, asgn2])
        db.commit()

        # 9. Audit Events

        db.add(AuditEvent(
            entity_type="incident",
            entity_id=inc1.id,
            action="citizen_sos_created",
            performed_by="Sunita Sharma (Simulated)",
            changes_json='{"status": "submitted", "priority": "critical"}'
        ))
        db.add(AuditEvent(
            entity_type="assignment",
            entity_id=asgn1.id,
            action="resource_dispatched",
            performed_by="dispatcher@resqnet.local",
            changes_json='{"resource": "Rescue Boat Swift-Delta 02", "incident_ref": "SOS-2026-FLOOD-8494"}'
        ))

        db.commit()
        print("[SUCCESS] Synthetic flood response data successfully seeded!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
