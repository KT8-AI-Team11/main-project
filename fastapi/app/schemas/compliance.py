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
