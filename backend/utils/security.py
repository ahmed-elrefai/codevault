from passlib.context import CryptContext
import hashlib
from datetime import datetime, timedelta
from .. import settings
from jose import jwt
# Define the hashing algorithm
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

with open("private_key.pem", "rb") as f:
    PRIVATE_KEY = f.read()

with open("public_key.pem", "rb") as f:
    PUBLIC_KEY = f.read()

ALGORITHM = "RS256"

def hash_password(password: str) -> str:
    # Pre-hash with SHA256 to ensure length < 72 bytes for bcrypt
    pre_hashed = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(pre_hashed)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(pre_hashed, hashed_password)


def create_access_token(user_id: int):
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, PRIVATE_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except jwt.PyJWTError:
        return None