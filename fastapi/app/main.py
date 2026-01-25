from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.health import router as health_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.ocr import router as ocr_router

def create_app() -> FastAPI:
    app = FastAPI(
        title="Cosmetics Compliance AI API",
        description="AI 기반 화장품 수출 규제 적합성 판정 서비스",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React dev
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # v1 routers
    app.include_router(health_router, prefix="/v1", tags=["Health"])
    app.include_router(compliance_router, prefix="/v1/compliance", tags=["Compliance"])
    app.include_router(ocr_router, prefix="/v1/ocr", tags=["OCR"])

    return app


app = create_app()
