from dotenv import load_dotenv
import os

load_dotenv()  # ← 여기서 .env 로드

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
REFLECTION_MODEL = os.getenv("REFLECTION_MODEL", OPENAI_MODEL)  # 미설정 시 기본 모델과 동일

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set")