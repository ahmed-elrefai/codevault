"""
AI GENERATED DOCUMENTATION
--------------------------
Description: Sets up a FastAPI application with async database initialization, table creation, CORS middleware, custom validation error handling, and includes authentication, CRUD, and AI routers.
Complexity: Time: O(1) | Space: O(1)
Tags: #python #fastapi #async #database #cors #exception-handling #router
"""

from fastapi import FastAPI
from backend import settings
from backend.auth.auth import router as auth_router
from backend.crud.routes import router as crud_router
from contextlib import asynccontextmanager
from backend.databases.db import get_db, db_instance
from backend.databases.schema import create_tables

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

import os

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    origins = [frontend_url]
    allow_creds = True
else:
    origins = ["*"]
    allow_creds = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=allow_creds,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.semantix.llms import router as ai_router

app.include_router(auth_router)
app.include_router(crud_router)
app.include_router(ai_router)