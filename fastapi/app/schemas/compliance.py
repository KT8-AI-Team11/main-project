from pydantic import BaseModel
from typing import List, Optional


# --- 텍스트 입력용 (기존 /check 엔드포인트에서 쓰는 DTO) ---
class ComplianceCheckRequest(BaseModel):
    market: str
    label_text: str
    product_type: Optional[str] = None
    language: Optional[str] = None


class Finding(BaseModel):
    snippet: str
    risk: str
    reason: str
    suggested_rewrite: Optional[str] = None


class ComplianceCheckResponse(BaseModel):
    overall_risk: str
    findings: List[Finding]
    notes: List[str]
    used_sources: List[str]


# --- 이미지 입력용 (check-from-image) ---
class CheckFromImageResponse(BaseModel):
    ocr_text: str
    overall_risk: str
    findings: List[Finding]
    notes: List[str]
