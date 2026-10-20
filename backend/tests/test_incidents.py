def test_create_citizen_sos_incident(client):
    payload = {
        "reporter_name": "Test Citizen",
        "reporter_contact": "555-010-9988",
        "reporter_is_victim": True,
        "disaster_type": "flood",
        "people_count": 4,
        "trapped_count": 4,
        "medical_assistance_needed": True,
        "special_needs_description": "Elderly person needing heart medication",
        "description": "Rapidly rising water around the building. First floor inundated. Trapped on second floor.",
        "address_text": "Building 12, River Street, Sector Alpha",
        "latitude": 28.5800,
        "longitude": 77.2200
    }
    response = client.post("/api/v1/incidents", json=payload)
    assert response.status_code == 201
    res_data = response.json()["data"]

    # Verify reference code format
    assert res_data["reference_code"].startswith("SOS-2026-FLOOD-")
    # Verify AI triage prioritization (medical + trapped => CRITICAL)
    assert res_data["priority"] == "critical"
    assert res_data["status"] == "submitted"
    assert res_data["ai_triage_score"] >= 70.0
    assert "Requires human dispatcher verification" in res_data["ai_recommendation_notes"]

    incident_id = res_data["id"]
    ref_code = res_data["reference_code"]

    # Test lookup by reference code
    ref_res = client.get(f"/api/v1/incidents/ref/{ref_code}")
    assert ref_res.status_code == 200
    assert ref_res.json()["data"]["id"] == incident_id

    # Test human dispatcher status update
    patch_res = client.patch(
        f"/api/v1/incidents/{incident_id}/status",
        json={"status": "verified", "notes": "Verified by drone reconnaissance"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["status"] == "verified"


def test_invalid_incident_input(client):
    # Invalid latitude/longitude and empty description
    payload = {
        "reporter_name": "A",
        "reporter_contact": "1",
        "description": "Too short",
        "address_text": "No",
        "latitude": 999.0,  # invalid latitude > 90
        "longitude": -200.0  # invalid longitude < -180
    }
    response = client.post("/api/v1/incidents", json=payload)
    assert response.status_code == 422
    assert response.json()["success"] is False
    assert "VALIDATION_ERROR" in response.json()["error"]["code"]
