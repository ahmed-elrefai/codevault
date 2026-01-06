from fastapi import APIRouter, Depends, HTTPException

import os
from settings import ROOT_DIR
from databases.db import AbstractDatabase, get_db
from databases.validators import (UserCreate, UserUpdate, UserResponse,
                                DocumentCreate, DocumentUpdate, DocumentResponse)
from utils.security import hash_password 

router = APIRouter(prefix=os.getenv("ROOT_ENDPOINT"))

@router.get("/users", response_model=list[UserResponse])
async def get_users(limit: int = 10, offset: int = 0, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM users LIMIT $1 OFFSET $2"
    result = await db.fetch(query, limit, offset)
    return result if result else []

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM users WHERE id = $1"
    result = await db.fetchrow(query, user_id)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result


@router.post("/users")
async def create_user(user: UserCreate, db: AbstractDatabase = Depends(get_db)):
    query = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)"
    hashed_pwd = hash_password(user.password)
    try:
        await db.execute(query, user.name, user.email, hashed_pwd)
    except Exception as e:

        if "unique constraint" in str(e).lower():
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    return {"message": "User created successfully"}
    

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user: UserUpdate, db: AbstractDatabase = Depends(get_db)):
    query = "UPDATE users SET name = $2, email = $3, password = $4 WHERE id = $1 RETURNING *"
    hashed_pwd = hash_password(user.password)
    try:
        result = await db.fetchrow(query, user_id, user.name, user.email, hashed_pwd)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result

@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "DELETE FROM users WHERE id = $1"
    try:
        await db.execute(query, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "User deleted successfully"}


@router.post("/documents")
async def create_document(document: DocumentCreate, db: AbstractDatabase = Depends(get_db)):
    
    query = "INSERT INTO documents (title, content, owner_id) VALUES ($1, $2, $3)"
    try:
        await db.execute(query, document.title, document.content, document.owner_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "Document created successfully"}

@router.get("/documents", response_model=list[DocumentResponse])
async def get_documents(db: AbstractDatabase = Depends(get_db), limit: int = 10, offset: int = 0):
    query = "SELECT * FROM documents LIMIT $1 OFFSET $2"
    result = await db.fetch(query, limit, offset)
    return result

@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document_by_id(document_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "SELECT * FROM documents WHERE id = $1"
    try:
        result = await db.fetchrow(query, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    return result

@router.put("/documents/{document_id}", response_model=DocumentResponse)
async def update_document(document_id: int, document: DocumentUpdate, db: AbstractDatabase = Depends(get_db)):
    query = "UPDATE documents SET title = $2, content = $3, owner_id = $4 WHERE id = $1 RETURNING *"
    try:
        result = await db.fetchrow(query, document_id, document.title, document.content, document.owner_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    return result

@router.delete("/documents/{document_id}")
async def delete_document(document_id: int, db: AbstractDatabase = Depends(get_db)):
    query = "DELETE FROM documents WHERE id = $1"
    try:
        await db.execute(query, document_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error: {}".format(e))
    
    return {"message": "Document deleted successfully"}
