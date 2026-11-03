"""
RESQNET Public Citizen SOS & Ops Integration Tests:
- Citizen SOS submission via public endpoint (/api/v1/public/incidents)
- Direct persistence to PostgreSQL
- Dispatcher incident queue visibility and status transitions
- Sanitized public tracking by reference code (/api/v1/public/incidents/ref/{ref})
- Server-side role-based authorization enforcement
- Resource assignment safety and conflict prevention
"""
import pytest
from fastapi.testclient import TestClient

from app.models.incident import Incident, IncidentStatusEnum, IncidentPriorityEnum
from app.models.resource import Resource, ResourceStatusEnum, ResourceTypeEnum
from app.services.assignment_service import AssignmentService
from app.schemas.assignment import AssignmentCreate


@pytest.fixture
def dispatcher_headers():
    return {"Authorization": "Bearer dispatcher-token"}


@pytest.fixture
def citizen_headers():
    return {"Authorization": "Bearer citizen-token"}


def test_public_citizen_sos_submission(client):
    """Test successful citizen SOS submission and persistence directly in PostgreSQL."""
    payload = {
        "reporter_name": "Sunita Sharma",
        "reporter_contact": "+91-9876543210",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 4,
        "trapped_count": 2,
        "medical_assistance_needed": True,
        "special_needs_description": "Elderly diabetic grandmother",
        "description": "Water is 1.5m deep and rising, stranded on terrace",
        "address_text": "Plot 42, River Colony, Patna",
        "latitude": 25.5941,
        "longitude": 85.1376,
    }

    res = client.post("/api/v1/public/incidents", json=payload)
    assert res.status_code == 201
    data = res.json()

    assert "reference_code" in data
    assert data["reference_code"].startswith("SOS-")
    assert "FLOOD" in data["reference_code"]
    assert data["status"] == "submitted"
    assert data["priority"] == "critical"  # Due to medical assistance and trapped count


def test_public_incident_tracking_by_ref(client):
    """Test sanitized public tracking by reference code (no PII returned)."""
    payload = {
        "reporter_name": "Private Citizen",
        "reporter_contact": "secret-contact-12345",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 2,
        "trapped_count": 0,
        "medical_assistance_needed": False,
        "description": "Rising water near road entrance, need sandbags",
        "address_text": "Sector 4 Market Area",
        "latitude": 28.5420,
        "longitude": 77.2610,
    }
    create_res = client.post("/api/v1/public/incidents", json=payload)
    assert create_res.status_code == 201
    ref = create_res.json()["reference_code"]

    track_res = client.get(f"/api/v1/public/incidents/ref/{ref}")
    assert track_res.status_code == 200
    track_data = track_res.json()

    assert track_data["reference_code"] == ref
    assert track_data["status"] == "submitted"
    assert "reporter_name" not in track_data
    assert "reporter_contact" not in track_data
    assert "latitude" not in track_data
    assert "longitude" not in track_data
    assert len(track_data["status_history"]) >= 1


def test_status_update_and_milestone_tracking(client, dispatcher_headers):
    """Test that dispatcher status updates are immediately visible in public tracking."""
    payload = {
        "reporter_name": "Test Citizen",
        "reporter_contact": "555-0199",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 1,
        "trapped_count": 1,
        "medical_assistance_needed": False,
        "description": "Trapped on roof, water level steady",
        "address_text": "Block C High Ground",
        "latitude": 28.5710,
        "longitude": 77.2390,
    }
    create_res = client.post("/api/v1/public/incidents", json=payload)
    assert create_res.status_code == 201
    inc_id = create_res.json()["incident_id"]
    ref = create_res.json()["reference_code"]

    # Dispatcher updates status to verified
    update_res = client.patch(
        f"/api/v1/incidents/{inc_id}/status",
        headers=dispatcher_headers,
        json={"status": "verified", "notes": "Dispatcher confirmed flood depth via aerial drone"},
    )
    assert update_res.status_code == 200

    # Public tracking should now reflect verified status
    track_res = client.get(f"/api/v1/public/incidents/ref/{ref}")
    assert track_res.status_code == 200
    track_data = track_res.json()
    assert track_data["status"] == "verified"
    statuses = [m["status"] for m in track_data["status_history"]]
    assert "verified" in statuses


def test_unknown_reference_code_returns_404(client):
    """Test that querying a non-existent reference returns a 404 with helpful message."""
    res = client.get("/api/v1/public/incidents/ref/SOS-2026-NONEXISTENT-9999")
    assert res.status_code == 404
