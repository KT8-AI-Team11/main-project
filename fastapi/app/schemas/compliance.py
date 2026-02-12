from dataclasses import dataclass

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

#---------------------------------------------------------#
# 문구용
#---------------------------------------------------------#

class LabelingCheckRequest(BaseModel):
    market: str = Field(default="US", description="국가 코드 (US, JP 등)")
    text: str = Field(..., description="문구 텍스트")

class Finding(BaseModel):
    snippet: str
    risk: str
    reason: str
    suggested_rewrite: Optional[str] = None

@dataclass
class LabelingLlmResult:
    overall_risk: str
    findings: List[Finding]
    notes: List[str]
    formatted_text: str | None = None

class LabelingCheckResponse(BaseModel):
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

#---------------------------------------------------------#
# 보고서 생성용
#---------------------------------------------------------#
class ReportDownloadRequest(BaseModel):
    market: str = Field(..., description="국가 코드")
    domain: Literal["labeling","ingredients"] = Field(...,description="분석 영역")
    product_name: str
    analysis_data: Dict[str, Any]

class IngredientDetail(BaseModel):
    ingredient: str
    regulation: str
    severity: str
    content: Optional[str] = None
    action: str

class ReportData(BaseModel):
    market: str
    product_name: str
    details: List[IngredientDetail]
    notes: Optional[List[str]] = []

class BatchReportRequest(BaseModel):
    domain: str = Field("ingredients", description="전성분 분석 영역")
    reports: List[ReportData] = Field(..., description="일괄 생성할 리포트들의 목록")