from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Job Portal API", "docs": "/docs"}


def test_login_invalid_credentials():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "wrong@example.com", "password": "wrong"},
    )
    assert response.status_code in {401, 500}
