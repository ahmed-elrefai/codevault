from pydantic import BaseModel
from datetime import datetime
from typing import Literal
class User(BaseModel):
    id: int
    name: str | None = None
    email: str | None = None
    password: str | None = None
    clerk_id: str | None = None


class Document(BaseModel):
    id: int
    title: str
    content: str
    owner_id: int
    created_at: datetime = datetime.now(datetime.timezone.utc)
    updated_at: datetime = datetime.now(datetime.timezone.utc)
    visibility:Literal["public", "private"] = "public"
