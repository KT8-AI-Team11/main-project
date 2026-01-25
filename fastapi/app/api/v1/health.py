from fastapi import APIRouter

# 서버 생존 확인용
router = APIRouter()


@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "fastapi",
    }
