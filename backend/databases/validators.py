# USER VALIDATORS

from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Literal
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
    visibility: Literal["public", "private"] = "public"
    burn_after_read: bool = False
    expires_at: datetime | None = None
    
class DocumentUpdate(BaseModel):
    title: str
    content: str
    visibility: Literal["public", "private"] = "public"
    burn_after_read: bool = False
    expires_at: datetime | None = None

# RESPONSE VALIDATORS

class UserResponse(BaseModel):
    id: int
    name: str | None = None
    email: EmailStr | None = None
    clerk_id: str | None = None

class DocumentResponse(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime
    visibility: Literal["public", "private"]
    burn_after_read: bool
    view_count: int
    expires_at: datetime | None
    


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