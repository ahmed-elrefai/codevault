import requests

API_URL = "http://localhost:8000"

def test_auth_flow():
    # 1. Login to get token (assuming a test user exists, otherwise sign up)
    email = "test@example.com"
    password = "password123"
    
    # Try login
    print("Logging in...")
    resp = requests.post(f"{API_URL}/auth/token", json={"email": email, "password": password})
    
    if resp.status_code == 401:
        # Try signup
        print("Login failed, trying signup...")
        requests.post(f"{API_URL}/auth/signup", json={"name": "Test User", "email": email, "password": password})
        resp = requests.post(f"{API_URL}/auth/token", json={"email": email, "password": password})
        
    if resp.status_code != 200:
        print(f"Auth Failed: {resp.text}")
        return

    token = resp.json()["access_token"]
    print(f"Got Token: {token[:10]}...")

    # 2. Call get_analyzer_key
    print("\nCalling get_analyzer_key...")
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{API_URL}/auth/get_analyzer_key", headers=headers)
    
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text}")

if __name__ == "__main__":
    test_auth_flow()
