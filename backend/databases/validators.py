class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserUpdate(BaseModel):
    username: str
    email: str
    password: str


class DocumentCreate(BaseModel):
    title: str
    content: str
    owner_id: int
    
class DocumentUpdate(BaseModel):
    title: str
    content: str