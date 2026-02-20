from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.schemas.ocr import OcrExtractResponse, OcrLine
from app.services.ocr_service import get_ocr_service
from starlette.concurrency import run_in_threadpool

router = APIRouter()


@router.post("/extract", response_model=OcrExtractResponse)
async def extract_text_from_image(image: UploadFile = File(...),
lang: str = Query(default="korean", description="korean | en | ch 등")
    ):
    if image.content_type not in ("image/png", "image/jpeg", "image/webp"):
        raise HTTPException(status_code=400, detail=f"Unsupported content-type: {image.content_type}")

    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    service = get_ocr_service(lang=lang)
    full_text, lines = await run_in_threadpool(service.extract, image_bytes)
    parts = [l.strip() for l in full_text.splitlines() if l.strip()]
    normalized_text = " ".join(parts)

    return OcrExtractResponse(
        language=lang,
        text=full_text,
        normalized_text=normalized_text,
        lines=[
            OcrLine(
                text=line.text,
                score=line.score,
                box=line.box,
            )
            for line in lines
        ],
    )
