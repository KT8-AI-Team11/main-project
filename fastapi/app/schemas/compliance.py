from dataclasses import dataclass

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


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

@dataclass
class LlmResult:
    overall_risk: str
    findings: List[Finding]
    notes: List[str]

class ComplianceCheckResponse(BaseModel):
    overall_risk: str
    findings: List[Finding]
    notes: List[str]

# 규제 확인 요청 폼
class CheckFromTextRequest(BaseModel):
    market: str = Field(default="HK", description="국가 코드 예: HK, JP, EU, US")
    text: str = Field(..., description="사용자가 검수/수정한 텍스트")
    domain: Literal["labeling", "ingredients"] = Field(
        default="labeling",
        description="문구 규제(labeling) / 전성분 규제(ingredients)"
    )

# --- 이미지 입력용 (check-from-image) ---
class CheckFromImageResponse(BaseModel):
    ocr_text: str
    overall_risk: str
    findings: List[Finding]
    notes: List[str]
