def test_transaction_safe_assignment_and_conflict_prevention(client):
    # 1. Create incident 1
    inc1_res = client.post("/api/v1/incidents", json={
        "reporter_name": "Victim 1",
        "reporter_contact": "555-010-0001",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 2,
        "description": "Flooded street, water in living room",
        "address_text": "10 Flood Alley",
        "latitude": 28.5700,
        "longitude": 77.2200
    })
    assert inc1_res.status_code == 201
    incident1_id = inc1_res.json()["data"]["id"]

    # 2. Create incident 2
    inc2_res = client.post("/api/v1/incidents", json={
        "reporter_name": "Victim 2",
        "reporter_contact": "555-010-0002",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 3,
        "description": "Basement flooded, electrical hazard",
        "address_text": "20 Flood Alley",
        "latitude": 28.5720,
        "longitude": 77.2220
    })
    assert inc2_res.status_code == 201
    incident2_id = inc2_res.json()["data"]["id"]

    # 3. Create resource
    res_res = client.post("/api/v1/resources", json={
        "name": "Rescue Boat Alpha-One",
        "resource_type": "boat",
        "status": "available",
        "passenger_capacity": 6,
        "crew_count": 2,
        "latitude": 28.5710,
        "longitude": 77.2210
    })
    assert res_res.status_code == 201
    resource_id = res_res.json()["data"]["id"]

    # 4. Assign resource to incident 1
    asgn_res = client.post("/api/v1/assignments", json={
        "incident_id": incident1_id,
        "resource_id": resource_id,
        "dispatcher_notes": "Immediate boat dispatch",
        "auto_dispatch": True
    })
    assert asgn_res.status_code == 201
    asgn_data = asgn_res.json()["data"]
    assert asgn_data["status"] == "dispatched"

    # Verify resource status transitioned to deployed
    res_check = client.get(f"/api/v1/resources?resource_type=boat")
    assert any(r["id"] == resource_id and r["status"] == "deployed" for r in res_check.json()["items"])

    # 5. ATTEMPT CONFLICTING ASSIGNMENT:
    # Try to assign the same busy resource to incident 2.
    # Must be rejected with HTTP 409 Conflict!
    conflict_res = client.post("/api/v1/assignments", json={
        "incident_id": incident2_id,
        "resource_id": resource_id,
        "dispatcher_notes": "Attempting conflicting assignment",
        "auto_dispatch": True
    })
    assert conflict_res.status_code == 409
    assert "already assigned to active assignment" in conflict_res.json()["error"]["message"]
