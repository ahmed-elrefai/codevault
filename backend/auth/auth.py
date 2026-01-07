from starlette import status
from starlette import status
from backend.databases.validators import UserLogin
from backend.databases.db import AbstractDatabase, get_db
from backend.utils.security import verify_password, create_access_token, verify_access_token,hash_password
from fastapi import HTTPException
from fastapi import APIRouter, Depends
from backend.databases.validators import UserResponse, UserCreate, AnalyzerKey
from backend.settings import API_KEY_EXPIRY, DEFAULT_ANALYZER_TRIALS
import backend.settings as settings
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token")
async def get_token(user_data: UserLogin, db: AbstractDatabase = Depends(get_db)):
    user = await db.fetchrow("SELECT name, email, password, id FROM users WHERE email = $1", user_data.email)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    # Check if user is dict or object
    # Handle both dict and object access just in case, though fetchrow returns dict-like usually
    stored_password = user['password'] if isinstance(user, dict) else user.password
    
    if not verify_password(user_data.password, stored_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    # helper to get ID safely
    user_id = user['id'] if isinstance(user, dict) else user.id

    access_token = create_access_token(user_id=user_id)
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme), db: AbstractDatabase = Depends(get_db)):
    user_id = verify_access_token(token)
    user = await db.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    return UserResponse(**user)

@router.post("/signup")
async def sign_up(user_data: UserCreate, db: AbstractDatabase = Depends(get_db)):
    query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)"
    hashed_pwd = hash_password(user_data.password)
    try:
        await db.execute(query, user_data.name, user_data.email, hashed_pwd)
    except Exception as e:

        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: {}".format(e))
    return {"message": "User created successfully"}

async def create_analyzer_key(user_id: int, db: AbstractDatabase):
    payload = {
        "user_id": user_id,
        "token": token_urlsafe(32),
        "expiry_date": datetime.now(timezone.utc) + timedelta(hours=24),
        "trials_left": settings.DEFAULT_ANALYZER_TRIALS
    }
    try:
        await db.execute("INSERT INTO analyzer_keys (user_id, token, expiry_date, trials_left) VALUES ($1, $2, $3, $4)",
         user_id, payload["token"], payload["expiry_date"], payload["trials_left"])
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: {}".format(e))

    return payload

async def revoke_analyzer_key(user_id: int, db: AbstractDatabase):
    try:
        await db.execute("DELETE FROM analyzer_keys WHERE user_id = $1", user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error: {}".format(e))

    return {"status": "success", "message": "Analyzer key revoked successfully"}
    

async def refresh_analyzer_key(user_id: int, db: AbstractDatabase):
    try: 
        response = await revoke_analyzer_key(user_id, db)
        if response["status"] != "success":
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to revoke analyzer key")
        key = await create_analyzer_key(user_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="failed to refresh analyzer key")
    return key

@router.get("/get_analyzer_key", response_model=AnalyzerKey)
async def get_analyzer_key(current_user: UserResponse = Depends(get_current_user), db: AbstractDatabase = Depends(get_db)):
    user_id = current_user.id
    key: AnalyzerKey | None = await db.fetchrow("SELECT user_id, token, expiry_date, trials_left FROM analyzer_keys WHERE user_id = $1", user_id)
    
    if not key:
        return await create_analyzer_key(user_id, db)
    
    expiry = key['expiry_date']
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
        
    if expiry <= datetime.now(timezone.utc):
        return await refresh_analyzer_key(user_id, db)
    elif key['trials_left'] <= 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No trials left, Wait 24 hours to get more")
    
    return key

async def verify_api_key(token: str, db: AbstractDatabase):
    key = await db.fetchrow("SELECT user_id, expiry_date, trials_left FROM analyzer_keys WHERE token = $1", token)
    
    if not key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API Key")

    expiry = key['expiry_date']
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=timezone.utc)
        
    if expiry <= datetime.now(timezone.utc):
         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="API Key Expired")

    if key['trials_left'] <= 0:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No trials left for this key")

    await db.execute("UPDATE analyzer_keys SET trials_left = trials_left - 1 WHERE token = $1", token)
    
    return key
