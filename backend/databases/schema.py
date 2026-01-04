from .db import AbstractDatabase

async def create_users_table(db: AbstractDatabase):
    await db.create_table(
        "users", 
        "id SERIAL PRIMARY KEY", 
        "name TEXT NOT NULL", 
        "email TEXT UNIQUE NOT NULL", 
        "password TEXT NOT NULL"
    )

async def create_documents_table(db: AbstractDatabase):
    await db.create_table(
        "documents", 
        "id SERIAL PRIMARY KEY", 
        "title TEXT NOT NULL", 
        "content TEXT NOT NULL", 
        "owner_id INTEGER REFERENCES users(id)",
        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    )

async def create_tables(db: AbstractDatabase):
    await create_users_table(db)
    await create_documents_table(db)

