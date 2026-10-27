import pytest
from app.models.resource import ResourceTypeEnum, ResourceStatusEnum
from app.models.assignment import AssignmentStatusEnum


def test_resource_detail_and_status_patch(client):
    # 1. Create a resource
    create_resp = client.post(
        "/api/v1/resources",
        json={
            "name": "Rescue Hovercraft Echo 01",
            "resource_type": "boat",
            "status": "available",
            "passenger_capacity": 6,
            "crew_count": 2,
            "battery_or_fuel_pct": 95,
            "latitude": 28.5900,
            "longitude": 77.2100,
            "contact_phone": "555-019-9999",
            "responder_lead_name": "Lt. Dan"
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert create_resp.status_code == 201
    resource_id = create_resp.json()["data"]["id"]

    # 2. Get resource detail
    detail_resp = client.get(f"/api/v1/resources/{resource_id}")
    assert detail_resp.status_code == 200
    assert detail_resp.json()["data"]["name"] == "Rescue Hovercraft Echo 01"

    # 3. Patch resource status
    patch_resp = client.patch(
        f"/api/v1/resources/{resource_id}/status",
        json={"status": "maintenance", "notes": "Engine inspection required"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["data"]["status"] == "maintenance"


def test_assignment_lifecycle_and_status_patch(client):
    # 1. Create an incident
    inc_resp = client.post(
        "/api/v1/incidents",
        json={
            "reporter_name": "Test Citizen",
            "reporter_contact": "555-010-9988",
            "description": "Family trapped on second floor due to water level.",
            "disaster_type": "flood",
            "latitude": 28.5800,
            "longitude": 77.2200,
            "people_count": 4,
            "trapped_count": 4,
            "medical_assistance_needed": False,
            "address_text": "Block 9, Green Park"
        }
    )
    assert inc_resp.status_code == 201
    inc_id = inc_resp.json()["data"]["id"]

    # 2. Verify incident
    client.patch(
        f"/api/v1/incidents/{inc_id}/status",
        json={"status": "verified", "notes": "Verified by control room"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )

    # 3. Create a resource
    res_resp = client.post(
        "/api/v1/resources",
        json={
            "name": "Zodiac Patrol Boat 09",
            "resource_type": "boat",
            "status": "available",
            "passenger_capacity": 8,
            "crew_count": 2,
            "latitude": 28.5800,
            "longitude": 77.2200
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert res_resp.status_code == 201
    res_id = res_resp.json()["data"]["id"]

    # 4. Create assignment
    asg_resp = client.post(
        "/api/v1/assignments",
        json={
            "incident_id": inc_id,
            "resource_id": res_id,
            "dispatcher_notes": "Immediate deployment",
            "auto_dispatch": False
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert asg_resp.status_code == 201
    asg_id = asg_resp.json()["data"]["id"]
    assert asg_resp.json()["data"]["status"] == "approved"

    # 5. List assignments
    list_asg = client.get("/api/v1/assignments")
    assert list_asg.status_code == 200
    assert any(a["id"] == asg_id for a in list_asg.json()["data"])

    # 6. Patch assignment to dispatched
    dispatch_resp = client.patch(
        f"/api/v1/assignments/{asg_id}/status",
        json={"status": "dispatched", "notes": "Unit en route"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert dispatch_resp.status_code == 200
    assert dispatch_resp.json()["data"]["status"] == "dispatched"

    # 7. Complete assignment -> releases resource back to available & incident to resolved
    complete_resp = client.patch(
        f"/api/v1/assignments/{asg_id}/status",
        json={"status": "completed", "notes": "Mission successfully accomplished"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert complete_resp.status_code == 200
    assert complete_resp.json()["data"]["status"] == "completed"

    # Verify resource is available again
    res_check = client.get(f"/api/v1/resources/{res_id}")
    assert res_check.json()["data"]["status"] == "available"


def test_inventory_creation_listing_and_quantity_adjustment(client):
    # 1. Create inventory item
    create_resp = client.post(
        "/api/v1/inventory",
        json={
            "item_name": "Bottled Mineral Water 20L",
            "category": "water",
            "quantity": 100,
            "unit": "cans",
            "reorder_threshold": 25
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert create_resp.status_code == 201
    item_id = create_resp.json()["data"]["id"]
    assert create_resp.json()["data"]["quantity"] == 100

    # 2. List inventory items
    list_resp = client.get("/api/v1/inventory?category=water")
    assert list_resp.status_code == 200
    assert any(i["id"] == item_id for i in list_resp.json()["items"])

    # 3. Increase quantity (+50)
    add_resp = client.patch(
        f"/api/v1/inventory/{item_id}/quantity",
        json={"delta": 50, "reason": "NGO donation received"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert add_resp.status_code == 200
    assert add_resp.json()["data"]["quantity"] == 150

    # 4. Decrease quantity (-30)
    deduct_resp = client.patch(
        f"/api/v1/inventory/{item_id}/quantity",
        json={"delta": -30, "reason": "Dispatched to Sector C shelter"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert deduct_resp.status_code == 200
    assert deduct_resp.json()["data"]["quantity"] == 120

    # 5. Over-deduction fails safely
    fail_resp = client.patch(
        f"/api/v1/inventory/{item_id}/quantity",
        json={"delta": -500, "reason": "Invalid withdrawal"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert fail_resp.status_code == 400


def test_audit_logs_recording_and_retrieval(client):
    # 1. Record an audit log
    rec_resp = client.post(
        "/api/v1/audit-logs",
        json={
            "entity_type": "disaster_alert",
            "entity_id": "alert-test-01",
            "action": "EMERGENCY_SIREN_TRIGGERED",
            "changes_json": '{"channel": "VHF_156.8"}'
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert rec_resp.status_code == 201
    log_id = rec_resp.json()["data"]["id"]

    # 2. Retrieve audit logs
    logs_resp = client.get("/api/v1/audit-logs?entity_type=disaster_alert")
    assert logs_resp.status_code == 200
    assert any(l["id"] == log_id for l in logs_resp.json()["items"])


def test_disaster_event_patch(client):
    # 1. Create event
    create_resp = client.post(
        "/api/v1/events",
        json={
            "name": "Cyclone Vardah Simulated Exercise",
            "disaster_type": "flood",
            "severity": "severe",
            "status": "active",
            "affected_region_name": "Southern Coastal Sector"
        },
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert create_resp.status_code == 201
    event_id = create_resp.json()["data"]["id"]

    # 2. Patch event severity to catastrophic
    patch_resp = client.patch(
        f"/api/v1/events/{event_id}",
        json={"severity": "catastrophic", "description": "Wind speeds updated to Category 5"},
        headers={"Authorization": "Bearer dispatcher-token"}
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["data"]["severity"] == "catastrophic"
