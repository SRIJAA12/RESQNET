def test_create_and_list_disaster_events(client):
    # 1. Create event
    payload = {
        "name": "Simulated Flash Flood - Basin 7",
        "disaster_type": "flood",
        "status": "active",
        "severity": "severe",
        "affected_region_name": "Basin 7 District",
        "description": "Simulation exercise scenario testing flood defense coordination."
    }
    response = client.post("/api/v1/events", json=payload)
    assert response.status_code == 201
    created = response.json()["data"]
    assert created["name"] == payload["name"]
    assert "id" in created

    # 2. List events
    list_res = client.get("/api/v1/events")
    assert list_res.status_code == 200
    events = list_res.json()["data"]
    assert len(events) >= 1
    assert any(e["id"] == created["id"] for e in events)
