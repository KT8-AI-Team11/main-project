from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from starlette.concurrency import run_in_threadpool
from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse, CheckFromImageResponse, Finding
from app.services.compliance_service import get_compliance_service

router = APIRouter()


@router.post("/check-from-image", response_model=CheckFromImageResponse)
async def check_from_image(
    market: str = "USA",
    text: str = ""
):
    if text == "":
        raise HTTPException(status_code=400, detail="Empty Text")

    svc = get_compliance_service()

    # todo: LLM 연결 및 반환값 처리
    normalized_text, llm_result = svc.check_from_text(
        market=market,
        text=text,
    )

    return CheckFromImageResponse(
        ocr_text=normalized_text,
        overall_risk=llm_result.overall_risk,
        findings=[
            Finding(
                snippet=f.snippet,
                risk=f.risk,
                reason=f.reason,
                suggested_rewrite=f.suggested_rewrite,
            )
            for f in llm_result.findings
        ],
        notes=llm_result.notes,
    )
