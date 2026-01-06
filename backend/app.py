from fastapi import FastAPI
import backend.settings # Load environment variables
from backend.auth.auth import router as auth_router
from backend.crud.routes import router as crud_router
from contextlib import asynccontextmanager
from backend.databases.db import get_db, db_instance
from backend.databases.schema import create_tables

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

from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(crud_router)