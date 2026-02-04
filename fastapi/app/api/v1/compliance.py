from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from starlette.concurrency import run_in_threadpool
from app.schemas.compliance import LabelingCheckResponse, Finding, LabelingLlmResult, IngredientsCheckResponse, Detail, \
    IngredientsCheckRequest, LabelingCheckRequest
from app.services.compliance_service import get_compliance_service

router = APIRouter()


# 텍스트 받으면 규제 확인
@router.post("/labeling", response_model=LabelingCheckResponse)
async def check_from_image(req: LabelingCheckRequest):
    if req.text == "":
        raise HTTPException(status_code=400, detail="Empty Text")

    svc = get_compliance_service()

    llm_result = svc.check_labeling(
        market=req.market,
        text=req.text,
    )

    return LabelingCheckResponse(
        market = req.market,
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
        formatted_text=llm_result.formatted_text,
    )

# 성분규제용
@router.post("/ingredients", response_model=IngredientsCheckResponse)
async def check_ingredients(req: IngredientsCheckRequest):
    if not req.ingredients.strip():
        raise HTTPException(status_code=400, detail="Empty Ingredients")

    svc = get_compliance_service()

    llm_result = svc.check_ingredients(
        market=req.market,
        text=req.ingredients,
    )

    return IngredientsCheckResponse(
        overall_risk=llm_result.overall_risk,
        details=[
            Detail(
                ingredient=d.ingredient,
                regulation=d.regulation,
                content = d.content,
                action = d.action,
                severity =  d.severity,
            )
            for d in llm_result.details
        ]
    )