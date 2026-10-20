def test_resource_registration_and_listing(client):
    payload = {
        "name": "Rescue Boat Delta-99",
        "resource_type": "boat",
        "status": "available",
        "passenger_capacity": 6,
        "crew_count": 2,
        "battery_or_fuel_pct": 100,
        "operational_notes": "Test boat",
        "contact_phone": "555-019-9901",
        "latitude": 28.5800,
        "longitude": 77.2200
    }
    response = client.post("/api/v1/resources", json=payload)
    assert response.status_code == 201
    created = response.json()["data"]
    assert created["name"] == payload["name"]

    # Filter resources
    list_res = client.get("/api/v1/resources?resource_type=boat&status=available")
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert any(r["id"] == created["id"] for r in items)
