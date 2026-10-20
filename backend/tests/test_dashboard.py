def test_dashboard_summary_metrics(client):
    response = client.get("/api/v1/dashboard/summary")
    assert response.status_code == 200
    data = response.json()["data"]

    assert "total_incidents" in data
    assert "active_incidents" in data
    assert "critical_incidents" in data
    assert "total_resources" in data
    assert "shelter_total_capacity" in data
    assert "unserved_critical_needs_count" in data
    assert "incidents_by_priority" in data
    assert "incidents_by_status" in data
