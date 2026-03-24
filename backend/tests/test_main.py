from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_read_root_returns_expected_welcome_message():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Huy blog"}


def test_health_check_returns_ok_status_payload():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_unknown_route_returns_404_with_detail_field():
    response = client.get("/does-not-exist")

    assert response.status_code == 404
    payload = response.json()
    assert "detail" in payload


def test_root_endpoint_rejects_post_method_with_405():
    response = client.post("/")

    assert response.status_code == 405
    payload = response.json()
    assert payload["detail"] == "Method Not Allowed"
