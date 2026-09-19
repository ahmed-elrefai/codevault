import pytest
from unittest.mock import patch

@pytest.mark.asyncio
async def test_get_me(async_client):
    with patch("backend.auth.auth.verify_access_token", return_value="mock_clerk_id"):
        response = await async_client.get("/auth/me", headers={"Authorization": "Bearer test_token"})
        assert response.status_code == 200
        data = response.json()
        assert data["clerk_id"] == "mock_clerk_id"
        assert data["id"] == 1 # First user created
        
@pytest.mark.asyncio
async def test_get_me_unauthorized(async_client):
    response = await async_client.get("/auth/me")
    assert response.status_code == 401
