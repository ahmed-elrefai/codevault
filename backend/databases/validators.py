# USER VALIDATORS

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

# RESPONSE VALIDATORS

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr