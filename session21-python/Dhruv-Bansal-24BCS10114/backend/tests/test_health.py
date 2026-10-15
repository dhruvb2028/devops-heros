from fastapi.testclient import TestClient


def test_health_reports_process_is_running():
    from app.main import app

    response = TestClient(app).get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_metrics_endpoint_exposes_request_counter():
    from app.main import app

    with TestClient(app) as client:
        client.get("/health")
        response = client.get("/metrics")
    assert response.status_code == 200
    assert "http_requests_total" in response.text
