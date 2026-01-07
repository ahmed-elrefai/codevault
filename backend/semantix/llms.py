from fastapi import APIRouter, Depends
from backend.databases.validators import ChatQuery
from backend.auth.auth import verify_api_key
from backend.databases.db import AbstractDatabase, get_db

from backend.semantix.service import analyze_code_with_llm

router = APIRouter(prefix="/llms", tags=["llms"])

async def require_valid_key(query: ChatQuery, db: AbstractDatabase = Depends(get_db)):
    await verify_api_key(query.analyzer_key, db)
    return True

@router.post("/analyze")
async def analyze_code(query: ChatQuery, authorized: bool = Depends(require_valid_key)):
    """
    Analyzes code snippet using Groq AI.
    Requires a valid analyzer_key in the request body.
    """
    return analyze_code_with_llm(query.user_input)


    