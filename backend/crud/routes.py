from fastapi import APIRouter
from dotenv import load_dotenv
import os
from settings import ROOT_DIR

load_dotenv(os.path.join(ROOT_DIR, ".env"))

router = APIRouter(prefix=os.getenv("ROOT_ENDPOINT"))

@router.get("/")
def root():
    return {"message": "Hello World"}
