from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
REFLECTION_MODEL = os.getenv("REFLECTION_MODEL", OPENAI_MODEL)

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set")