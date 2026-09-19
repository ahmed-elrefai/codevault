from passlib.context import CryptContext
import hashlib
from datetime import datetime, timedelta, UTC
from backend import settings
import jwt
from jwt import PyJWKClient
import os
import base64
from secrets import token_urlsafe
from fastapi import HTTPException, Depends
from backend.databases.validators import AnalyzerKey

# Define the hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Extract Frontend API URL from Clerk Publishable Key in environment variables
# Note: In a robust app, you would pass VITE_CLERK_PUBLISHABLE_KEY to the backend .env as well.
# Since we saw it in backend/.env, we can read it:
CLERK_PUB_KEY = os.getenv("VITE_CLERK_PUBLISHABLE_KEY", "pk_test_bGlnaHQtY295b3RlLTczMzcuY2xlcmsuYWNjb3VudHMuZGV2JA")
clerk_domain = base64.b64decode(CLERK_PUB_KEY.split('_')[2][:-2]).decode('utf-8')
jwks_url = f"https://{clerk_domain}/.well-known/jwks.json"

jwks_client = PyJWKClient(jwks_url)

def hash_password(password: str) -> str:
    # Pre-hash with SHA256 to ensure length < 72 bytes for bcrypt
    pre_hashed = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hashed)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(pre_hashed, hashed_password)

def verify_access_token(token: str):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        # Verify token. Clerk uses RS256. 
        # We don't enforce audience here since Clerk frontend tokens sometimes don't have it by default unless specified
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        # Clerk stores the user's ID in the 'sub' claim
        return payload.get("sub")
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None