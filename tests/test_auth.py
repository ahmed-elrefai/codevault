
import pytest
from backend.utils.security import hash_password

@pytest.mark.asyncio
async def test_signup(async_client):
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "strongpassword"
    }
    response = await async_client.post("/auth/signup", json=payload)
    assert response.status_code == 200
    assert response.json() == {"message": "User created successfully"}

@pytest.mark.asyncio
async def test_login(async_client):
    # Ensure user exists (depends on shared mock state in conftest, specifically MockDatabase singleton)
    # Ideally should re-seed, but for simple flow:
    
    # 1. Signup again or assume state from previous test? 
    # Pytest runs nicely, but singleton mock persists across tests in same session if defined at top level?
    # Actually, let's just re-signup to be safe/atomic if we can, or rely on mock logic.
    
    payload = {
        "name": "Login User",
        "email": "login@example.com",
        "password": "password123"
    }
    await async_client.post("/auth/signup", json=payload)

    login_payload = {
         "email": "login@example.com",
         "password": "password123"
    }
    response = await async_client.post("/auth/token", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]

@pytest.mark.asyncio
async def test_login_invalid_credentials(async_client):
    login_payload = {
         "email": "wrong@example.com",
         "password": "wrongpassword"
    }
    response = await async_client.post("/auth/token", json=login_payload)
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_get_me(async_client):
    # 1. Signup and Login
    payload = {"name": "Me User", "email": "me@example.com", "password": "pwm"}
    await async_client.post("/auth/signup", json=payload)
    
    login_res = await async_client.post("/auth/token", json={"email": "me@example.com", "password": "pwm"})
    token = login_res.json()["access_token"]

    # 2. Get Me
    response = await async_client.get("/auth/me", params={"token": token})
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
