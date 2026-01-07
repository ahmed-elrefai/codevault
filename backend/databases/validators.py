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
    
class DocumentUpdate(BaseModel):
    title: str
    content: str

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

# LLMS
class ChatQuery(BaseModel):
    user_input: str
    analyzer_key: str

class AnalyzerKey(BaseModel):
    user_id: int
    token: str
    expiry_date: datetime
    trials_left: int