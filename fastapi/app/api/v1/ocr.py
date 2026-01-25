from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.schemas.ocr import OcrExtractResponse, OcrLine
from app.services.ocr_service import get_ocr_service
from starlette.concurrency import run_in_threadpool

router = APIRouter()


@router.post("/extract", response_model=OcrExtractResponse)
async def extract_text_from_image(image: UploadFile = File(...),
lang: str = Query(default="korean", description="korean | en | ch 등")
    ):
    # 1) 기본 검증
    if image.content_type not in ("image/png", "image/jpeg", "image/webp"):
        raise HTTPException(status_code=400, detail=f"Unsupported content-type: {image.content_type}")

    # 2) 파일 바이트 읽기
    image_bytes = await image.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    # 여기서부터 OCR 처리로 이어짐 (지금은 더미)
    service = get_ocr_service(lang=lang) # 일단은 한국어 default로. todo: 언어 힌트 설정
    full_text, lines = await run_in_threadpool(service.extract, image_bytes)

    # 3) JSON 응답
    return OcrExtractResponse(
        language=lang,
        text=full_text,
        lines=[
            OcrLine(
                text=line.text, # 텍스트
                score=line.score, # 예상되는 정확도
                box=line.box, # 텍스트 박스의 꼭짓점. todo: 이걸 llm에 활용해보기?
            )
            for line in lines
        ],
    )
