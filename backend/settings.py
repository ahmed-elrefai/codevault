from pathlib import Path
from dotenv import load_dotenv
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(os.path.join(ROOT_DIR, ".env"))

# AI API SETTINGS
DEFAULT_ANALYZER_TRIALS = 7
API_KEY_EXPIRY = 24

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
AI_MODEL = "llama-3.3-70b-versatile"

