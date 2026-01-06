# USER VALIDATORS

from datetime import datetime
from pydantic import BaseModel, EmailStr
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str
    email: EmailStr
    password: str

# DOCUMENT VALIDATORS

class DocumentCreate(BaseModel):
    title: str
    content: str
    owner_id: int
    
class DocumentUpdate(BaseModel):
    title: str
    content: str
    updated_at: datetime

# RESPONSE VALIDATORS

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseModel):
    email: EmailStr
    password: str