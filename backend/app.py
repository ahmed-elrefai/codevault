from fastapi import FastAPI
from crud.routes import router
from contextlib import asynccontextmanager
from databases.db import get_db, db_instance
from databases.schema import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("initializing database...")
    await db_instance.initialize()
    print("connection pool created...")
    await create_tables(db_instance)
    print("tables created...")
    print("Database initialized successfully!")
    yield
    await db_instance.close()
    print("Database connection closed")

app = FastAPI(lifespan=lifespan)

app.include_router(router)