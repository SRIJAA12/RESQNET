"""
RESQNET Phase 3 Integration Tests:
- Citizen SOS submission to DynamoDB
- Bi-directional synchronization between DynamoDB and PostgreSQL
- Idempotency and duplicate prevention
- Dispatcher incident queue visibility
- Server-side role-based authorization enforcement
- Mandatory incident rejection reasons
- Status transition validation
- Milestone propagation to DynamoDB and sanitized public tracking
- Resource assignment safety and conflict prevention
"""
import uuid
import pytest
from fastapi.testclient import TestClient

from backend_serverless.repository.dynamo_repo import InMemoryIncidentRepository, set_incident_repository
from backend_serverless.services.incident_service import (
    create_citizen_incident,
    get_sanitized_incident_tracking,
)
from backend_serverless.schemas.incident import PublicIncidentCreate
from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum
from app.models.resource import Resource, ResourceStatusEnum, ResourceTypeEnum
from app.services.incident_sync_service import IncidentSyncService
from app.services.assignment_service import AssignmentService
from app.schemas.assignment import AssignmentCreate


@pytest.fixture
def test_dynamo_repo():
    """Provides a fresh isolated in-memory DynamoDB repository for each test."""
    repo = InMemoryIncidentRepository()
    set_incident_repository(repo)
    return repo


@pytest.fixture
def dispatcher_headers():
    return {"Authorization": "Bearer dispatcher-token"}


@pytest.fixture
def citizen_headers():
    return {"Authorization": "Bearer citizen-token"}


def test_citizen_sos_submission_and_dynamo_persistence(test_dynamo_repo):
    """1. Test successful citizen SOS submission and persistence in DynamoDB."""
    payload = PublicIncidentCreate(
        reporter_name="Sunita Sharma",
        reporter_contact="+91-9876543210",
        reporter_is_victim=True,
        disaster_type="flood",
        people_count=4,
        trapped_count=2,
        medical_assistance_needed=True,
        special_needs_description="Elderly diabetic grandmother",
        description="Water is 1.5m deep and rising, stranded on terrace",
        address_text="Plot 42, River Colony, Patna",
        latitude=25.5941,
        longitude=85.1376,
    )

    response = create_citizen_incident(payload, test_dynamo_repo)

    assert response.reference_code.startswith("SOS-2026-FLOOD-")
    assert response.priority == "critical"
    assert response.status == "submitted"

    # Verify item persisted in DynamoDB
    item = test_dynamo_repo.get_by_reference(response.reference_code)
    assert item is not None
    assert item["reference_code"] == response.reference_code
    assert item["status"] == "submitted"


def test_sync_incident_into_postgresql_and_stable_reference_mapping(db_session, test_dynamo_repo):
    """2. Test synchronization of DynamoDB SOS into PostgreSQL with stable reference mapping."""
    payload = PublicIncidentCreate(
        reporter_name="Aarav Patel",
        reporter_contact="555-019-2834",
        reporter_is_victim=True,
        disaster_type="flood",
        people_count=3,
        trapped_count=0,
        medical_assistance_needed=False,
        description="Flood waters entered living room, need shelter transfer",
        address_text="Flat 102, Shanti Apartments",
        latitude=28.5710,
        longitude=77.2390,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)
    dynamo_item = test_dynamo_repo.get_by_reference(creation_resp.reference_code)

    sync_service = IncidentSyncService(db_session, dynamo_repo=test_dynamo_repo)
    pg_incident, is_new = sync_service.sync_incident_from_dynamo(dynamo_item)

    assert is_new is True
    assert pg_incident.reference_code == creation_resp.reference_code
    assert pg_incident.status == IncidentStatusEnum.SUBMITTED
    assert pg_incident.people_count == 3
    assert pg_incident.reporter_name == "Aarav Patel"

    # Status history in PostgreSQL recorded
    assert len(pg_incident.status_history) >= 1
    assert pg_incident.status_history[0].new_status == "submitted"


def test_duplicate_delivery_or_retry_idempotency(db_session, test_dynamo_repo):
    """3. Test idempotency: duplicate delivery does not create duplicate PostgreSQL records."""
    payload = PublicIncidentCreate(
        reporter_name="Meera Iyer",
        reporter_contact="555-019-9999",
        disaster_type="flood",
        people_count=2,
        trapped_count=1,
        medical_assistance_needed=False,
        description="Stranded near marketplace, water level waist-high",
        address_text="Market Square, Ward 4",
        latitude=28.5800,
        longitude=77.2400,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)
    dynamo_item = test_dynamo_repo.get_by_reference(creation_resp.reference_code)

    sync_service = IncidentSyncService(db_session, dynamo_repo=test_dynamo_repo)

    # First sync
    inc1, is_new1 = sync_service.sync_incident_from_dynamo(dynamo_item)
    assert is_new1 is True

    # Duplicate delivery / retry sync
    inc2, is_new2 = sync_service.sync_incident_from_dynamo(dynamo_item)
    assert is_new2 is False
    assert inc1.id == inc2.id
    assert inc1.reference_code == inc2.reference_code

    # Total incidents with this reference in PostgreSQL is exactly 1
    total = db_session.query(Incident).filter(Incident.reference_code == creation_resp.reference_code).count()
    assert total == 1


def test_dispatcher_queue_visibility_and_sync_endpoint(client, db_session, test_dynamo_repo, dispatcher_headers):
    """4. Test that sync endpoint populates the dispatcher queue."""
    # Ingest incident in DynamoDB
    payload = PublicIncidentCreate(
        reporter_name="Karan Malhotra",
        reporter_contact="555-019-5555",
        disaster_type="cyclone",
        people_count=6,
        trapped_count=0,
        medical_assistance_needed=True,
        description="Roof blown off, elderly patient requires medical evacuation",
        address_text="Coastal Road Sector 1",
        latitude=19.0760,
        longitude=72.8777,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)

    # Dispatcher calls POST /api/v1/incidents/sync
    sync_resp = client.post("/api/v1/incidents/sync", headers=dispatcher_headers)
    assert sync_resp.status_code == 200
    sync_data = sync_resp.json()["data"]
    assert sync_data["synced_count"] >= 1

    # Check dispatcher queue GET /api/v1/incidents
    queue_resp = client.get("/api/v1/incidents?search=Karan", headers=dispatcher_headers)
    assert queue_resp.status_code == 200
    items = queue_resp.json()["items"]
    assert len(items) >= 1
    assert items[0]["reference_code"] == creation_resp.reference_code


def test_unauthorized_users_cannot_perform_dispatcher_actions(client, citizen_headers):
    """5. Security: Citizen role cannot access dispatcher sync or status updates."""
    # Attempt sync with citizen credentials
    sync_resp = client.post("/api/v1/incidents/sync", headers=citizen_headers)
    assert sync_resp.status_code == 403
    err_msg = sync_resp.json().get("error", {}).get("message", "") or sync_resp.json().get("detail", "")
    assert "dispatcher" in err_msg.lower()

    # Attempt status patch with citizen credentials
    patch_resp = client.patch(
        f"/api/v1/incidents/{uuid.uuid4()}/status",
        json={"status": "verified", "notes": "I verify myself"},
        headers=citizen_headers,
    )
    assert patch_resp.status_code == 403


def test_incident_rejection_requires_mandatory_reason(client, db_session, test_dynamo_repo, dispatcher_headers):
    """6. Operational safety: Rejection requires a mandatory reason."""
    payload = PublicIncidentCreate(
        reporter_name="Test Person",
        reporter_contact="555-000-0000",
        disaster_type="flood",
        people_count=1,
        trapped_count=0,
        medical_assistance_needed=False,
        description="Testing rejection without reason constraint",
        address_text="Some address",
        latitude=28.5,
        longitude=77.2,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)
    sync_service = IncidentSyncService(db_session, dynamo_repo=test_dynamo_repo)
    inc, _ = sync_service.sync_incident_from_dynamo(test_dynamo_repo.get_by_reference(creation_resp.reference_code))

    # Rejection without notes must fail with 400 Bad Request
    fail_resp = client.patch(
        f"/api/v1/incidents/{inc.id}/status",
        json={"status": "rejected", "notes": ""},
        headers=dispatcher_headers,
    )
    assert fail_resp.status_code == 400
    err_msg = fail_resp.json().get("error", {}).get("message", "") or fail_resp.json().get("detail", "")
    assert "reason is required" in err_msg.lower()

    # Rejection with operational reason succeeds
    ok_resp = client.patch(
        f"/api/v1/incidents/{inc.id}/status",
        json={"status": "rejected", "notes": "Duplicate entry confirmed by dispatcher via callback."},
        headers=dispatcher_headers,
    )
    assert ok_resp.status_code == 200
    assert ok_resp.json()["data"]["status"] == "rejected"


def test_invalid_status_transitions_rejected(client, db_session, test_dynamo_repo, dispatcher_headers):
    """7. Workflow safety: Invalid status transitions are rejected."""
    payload = PublicIncidentCreate(
        reporter_name="Valid Flow User",
        reporter_contact="555-111-2222",
        disaster_type="flood",
        people_count=2,
        trapped_count=0,
        medical_assistance_needed=False,
        description="Water receding, testing lifecycle terminal state",
        address_text="Safe Street 5",
        latitude=28.5,
        longitude=77.2,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)
    sync_service = IncidentSyncService(db_session, dynamo_repo=test_dynamo_repo)
    inc, _ = sync_service.sync_incident_from_dynamo(test_dynamo_repo.get_by_reference(creation_resp.reference_code))

    # Transition to rejected with reason
    client.patch(
        f"/api/v1/incidents/{inc.id}/status",
        json={"status": "rejected", "notes": "Confirmed non-emergency"},
        headers=dispatcher_headers,
    )

    # Attempting to transition from rejected back to submitted must be rejected
    resubmit_resp = client.patch(
        f"/api/v1/incidents/{inc.id}/status",
        json={"status": "submitted", "notes": "Trying to revive rejected incident"},
        headers=dispatcher_headers,
    )
    assert resubmit_resp.status_code == 400
    err_msg = resubmit_resp.json().get("error", {}).get("message", "") or resubmit_resp.json().get("detail", "")
    assert "invalid status transition" in err_msg.lower()


def test_status_update_propagates_milestone_to_dynamo_and_public_tracking(
    client, db_session, test_dynamo_repo, dispatcher_headers
):
    """8. Bi-directional sync: Dispatcher verification updates DynamoDB & public tracking."""
    payload = PublicIncidentCreate(
        reporter_name="Ravi Shankar",
        reporter_contact="555-987-6543",
        disaster_type="flood",
        people_count=4,
        trapped_count=2,
        medical_assistance_needed=True,
        description="Stranded with children on roof of single-story house",
        address_text="North Bank Road, Sector 3",
        latitude=28.5600,
        longitude=77.2450,
    )
    creation_resp = create_citizen_incident(payload, test_dynamo_repo)
    ref = creation_resp.reference_code

    # Initial tracking check
    tracking_before = get_sanitized_incident_tracking(ref, test_dynamo_repo)
    assert tracking_before.status == "submitted"

    # Sync into PostgreSQL
    sync_service = IncidentSyncService(db_session, dynamo_repo=test_dynamo_repo)
    inc, _ = sync_service.sync_incident_from_dynamo(test_dynamo_repo.get_by_reference(ref))

    # Dispatcher verifies incident in PostgreSQL
    verify_resp = client.patch(
        f"/api/v1/incidents/{inc.id}/status",
        json={"status": "verified", "notes": "Coordinates confirmed by drone reconnaissance."},
        headers=dispatcher_headers,
    )
    assert verify_resp.status_code == 200

    # Public tracking immediately reflects "verified" status and sanitized milestone in DynamoDB
    tracking_after = get_sanitized_incident_tracking(ref, test_dynamo_repo)
    assert tracking_after is not None
    assert tracking_after.status == "verified"

    # Verify milestones include the verification note
    history_statuses = [m.status for m in tracking_after.status_history]
    assert "submitted" in history_statuses
    assert "verified" in history_statuses

    # Verify PII is NOT in public tracking response
    tracking_dict = tracking_after.model_dump()
    assert "reporter_name" not in tracking_dict
    assert "reporter_contact" not in tracking_dict
    assert "latitude" not in tracking_dict
    assert "longitude" not in tracking_dict


def test_resource_assignment_safety_and_conflict_prevention(db_session):
    """9. Assignment safety: Ineligible/unavailable resources cannot be assigned."""
    assignment_service = AssignmentService(db_session)

    # Create an incident in PostgreSQL
    inc = Incident(
        reference_code=f"SOS-2026-TEST-{uuid.uuid4().hex[:4].upper()}",
        reporter_name="Test Civ",
        reporter_contact="555-000-1111",
        description="Need rescue unit",
        address_text="Near Lake",
        latitude=28.5,
        longitude=77.2,
        status=IncidentStatusEnum.VERIFIED,
        priority=IncidentPriorityEnum.CRITICAL,
    )
    db_session.add(inc)

    # Create a resource currently in MAINTENANCE
    maintenance_res = Resource(
        name="Rescue Boat Charlie (Under Repair)",
        resource_type=ResourceTypeEnum.BOAT,
        status=ResourceStatusEnum.MAINTENANCE,
        passenger_capacity=6,
        latitude=28.5,
        longitude=77.2,
    )
    db_session.add(maintenance_res)
    db_session.commit()

    # Attempt assignment to maintenance resource -> must fail with 400 Bad Request
    with pytest.raises(Exception) as exc_info:
        assignment_service.create_assignment(
            data=AssignmentCreate(incident_id=inc.id, resource_id=maintenance_res.id, auto_dispatch=True),
            dispatcher_user_id="user-123",
        )
    assert "maintenance" in str(exc_info.value).lower()


def test_unknown_reference_code_handling(client, test_dynamo_repo):
    """10. Controlled not-found responses for unknown reference codes."""
    # FastAPI endpoint returns 404
    resp = client.get("/api/v1/incidents/ref/SOS-2026-NONEXISTENT-9999")
    assert resp.status_code == 404
    err_msg = resp.json().get("error", {}).get("message", "") or resp.json().get("detail", "")
    assert "not found" in err_msg.lower()

    # Serverless tracking returns None
    result = get_sanitized_incident_tracking("SOS-2026-NONEXISTENT-9999", test_dynamo_repo)
    assert result is None
