def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["components"]["application"] == "healthy"
    assert data["components"]["database"] == "healthy"
    # Verify no credentials or connection strings leaked
    assert "password" not in response.text
    assert "postgresql://" not in response.text
    assert "secret" not in response.text
