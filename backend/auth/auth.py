from starlette import status
from backend.databases.validators import UserLogin
from backend.databases.db import AbstractDatabase, get_db
from backend.utils.security import verify_password, verify_access_token, hash_password
from fastapi import HTTPException
from fastapi import APIRouter, Depends
from backend.databases.validators import UserResponse, UserCreate, AnalyzerKey
from backend.settings import API_KEY_EXPIRY, DEFAULT_ANALYZER_TRIALS
import backend.settings as settings
from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe

router = APIRouter(prefix="/auth", tags=["Authentication"])

from fastapi.security import OAuth2PasswordBearer

# We can keep tokenUrl as "/auth/token" if we want, but frontend doesn't use it anymore
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme), db: AbstractDatabase = Depends(get_db)):
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    
    clerk_id = verify_access_token(token)
    if not clerk_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Fetch user by clerk_id
    user = await db.fetchrow("SELECT * FROM users WHERE clerk_id = $1", clerk_id)
    
    if not user:
        # Auto-provision user in our database
        await db.execute("INSERT INTO users (clerk_id) VALUES ($1)", clerk_id)
        user = await db.fetchrow("SELECT * FROM users WHERE clerk_id = $1", clerk_id)
        
    return UserResponse(**user)

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

    return key
