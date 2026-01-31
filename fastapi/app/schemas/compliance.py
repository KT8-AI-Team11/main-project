from dataclasses import dataclass

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


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
    formatted_text: str | None = None

class ComplianceCheckResponse(BaseModel):
    market: str
    overall_risk: str
    findings: List[Finding]
    notes: List[str]
    formatted_text: str | None = None

#---------------------------------------------------------#
# 전성분용
#---------------------------------------------------------#

class IngredientsCheckRequest(BaseModel):
    market: str = Field(default="US", description="국가 코드 (US, JP 등)")
    ingredients: str = Field(..., description="전성분 텍스트")

class Detail(BaseModel):
    ingredient: str
    regulation: str
    content: str
    action: str
    severity: str

@dataclass
class IngLlmResult:
    overall_risk: str
    details: List[Detail]

class IngredientsCheckResponse(BaseModel):
    overall_risk: str
    details: List[Detail]
