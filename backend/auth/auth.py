from starlette import status
from starlette import status
from backend.databases.validators import UserLogin
from backend.databases.db import AbstractDatabase, get_db
from backend.utils.security import verify_password, create_access_token, verify_access_token,hash_password
from fastapi import HTTPException
from fastapi import APIRouter, Depends
from backend.databases.validators import UserResponse, UserCreate

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/token")
async def get_token(user_data: UserLogin, db: AbstractDatabase = Depends(get_db)):
    user = await db.fetchrow("SELECT name, email, password FROM users WHERE email = $1", user_data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token = create_access_token(user_id=user.id)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str, db: AbstractDatabase = Depends(get_db)):
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
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    return {"message": "User created successfully"}
