from pydantic import BaseModel
from datetime import datetime

class User(BaseModel):
    id: int
    name: str
    email: str
    password: str


class Document(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    created_at: datetime = datetime.now(datetime.timezone.utc)
    updated_at: datetime = datetime.now(datetime.timezone.utc)


