def test_shelter_lifecycle_and_capacity(client):
    payload = {
        "name": "North District Shelter Alpha",
        "status": "active",
        "address": "90 Shelter Avenue, Safe Zone",
        "contact_phone": "555-019-2233",
        "capacity_total": 200,
        "current_occupancy": 50,
        "medical_facilities_available": True,
        "generator_backup": True,
        "pet_friendly": True,
        "latitude": 28.6100,
        "longitude": 77.2000
    }
    response = client.post("/api/v1/shelters", json=payload)
    assert response.status_code == 201
    shelter = response.json()["data"]
    assert shelter["available_beds"] == 150
    shelter_id = shelter["id"]

    # Update capacity to full
    patch_res = client.patch(
        f"/api/v1/shelters/{shelter_id}",
        json={"current_occupancy": 200, "notes": "Reached maximum capacity"}
    )
    assert patch_res.status_code == 200
    updated = patch_res.json()["data"]
    assert updated["available_beds"] == 0
    assert updated["status"] == "full"
