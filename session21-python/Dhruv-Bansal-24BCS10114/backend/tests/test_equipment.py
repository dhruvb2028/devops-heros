import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool


@pytest.fixture
def client():
    from app.db import Base, get_db
    from app.main import app

    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)

    def test_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()


def create_equipment(client, name="USB microscope"):
    response = client.post(
        "/api/equipment",
        json={"name": name, "category": "Imaging", "location": "Lab B"},
    )
    assert response.status_code == 201
    return response.json()


def test_created_equipment_appears_in_catalog(client):
    item = create_equipment(client)
    response = client.get("/api/equipment")
    assert response.status_code == 200
    assert response.json() == [item]
    assert item["status"] == "available"


def test_equipment_details_can_be_updated(client):
    item = create_equipment(client)
    response = client.put(
        f"/api/equipment/{item['id']}",
        json={"location": "Lab C", "status": "maintenance"},
    )
    assert response.status_code == 200
    assert response.json()["location"] == "Lab C"
    assert response.json()["status"] == "maintenance"


def test_deleted_equipment_is_no_longer_available(client):
    item = create_equipment(client)
    assert client.delete(f"/api/equipment/{item['id']}").status_code == 204
    assert client.get(f"/api/equipment/{item['id']}").status_code == 404


def test_checked_out_equipment_cannot_be_checked_out_twice(client):
    item = create_equipment(client)
    first = client.post(
        f"/api/equipment/{item['id']}/checkout",
        json={"borrower": "Maya", "due_date": "2026-11-01"},
    )
    assert first.status_code == 200
    assert first.json()["status"] == "checked_out"
    assert first.json()["borrower"] == "Maya"
    second = client.post(
        f"/api/equipment/{item['id']}/checkout",
        json={"borrower": "Ravi", "due_date": "2026-11-02"},
    )
    assert second.status_code == 409


def test_return_makes_equipment_available_again(client):
    item = create_equipment(client)
    client.post(
        f"/api/equipment/{item['id']}/checkout",
        json={"borrower": "Maya", "due_date": "2026-11-01"},
    )
    response = client.post(f"/api/equipment/{item['id']}/return")
    assert response.status_code == 200
    assert response.json()["status"] == "available"
    assert response.json()["borrower"] is None
    assert response.json()["due_date"] is None


def test_stats_reflect_equipment_status(client):
    first = create_equipment(client, "Camera")
    create_equipment(client, "Tripod")
    client.post(
        f"/api/equipment/{first['id']}/checkout",
        json={"borrower": "Maya", "due_date": "2026-11-01"},
    )
    response = client.get("/api/equipment/stats")
    assert response.status_code == 200
    assert response.json() == {
        "total": 2,
        "available": 1,
        "checked_out": 1,
        "maintenance": 0,
    }


def test_checked_out_equipment_cannot_be_deleted(client):
    item = create_equipment(client)
    client.post(
        f"/api/equipment/{item['id']}/checkout",
        json={"borrower": "Maya", "due_date": "2026-11-01"},
    )
    assert client.delete(f"/api/equipment/{item['id']}").status_code == 409


def test_ready_checks_the_database(client):
    response = client.get("/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}
