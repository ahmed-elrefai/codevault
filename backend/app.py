"""
AI GENERATED DOCUMENTATION
--------------------------
Description: Sets up a FastAPI application with async database initialization, table creation, CORS middleware, custom validation error handling, and includes authentication, CRUD, and AI routers.
Complexity: Time: O(1) | Space: O(1)
Tags: #python #fastapi #async #database #cors #exception-handling #router
"""

from fastapi import FastAPI
from . import settings
from .auth.auth import router as auth_router
from .crud.routes import router as crud_router
from contextlib import asynccontextmanager
from .databases.db import get_db, db_instance
from .databases.schema import create_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db_instance.initialize()
    await create_tables(db_instance)
    yield
    await db_instance.close()

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI(lifespan=lifespan)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation Error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )

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

from backend.semantix.llms import router as ai_router

app.include_router(auth_router)
app.include_router(crud_router)
app.include_router(ai_router)