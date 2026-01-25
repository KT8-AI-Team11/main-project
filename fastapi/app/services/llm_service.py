from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class LlmFinding:
    snippet: str
    risk: str
    reason: str
    suggested_rewrite: str | None = None


@dataclass
class LlmResult:
    overall_risk: str
    findings: List[LlmFinding]
    notes: List[str]


class LlmService:
    """
    OCR 텍스트를 받아 규제 리스크를 요약/판정하는 LLM 서비스
    - 지금은 '구조'만 잡아두고, 실제 모델 호출은 TODO로 둠
    """

    def analyze_label_text(self, market: str, text: str) -> LlmResult:
        # TODO: 실제 LLM 호출(예: OpenAI) + JSON 파싱
        # 지금은 더미로 반환
        return LlmResult(
            overall_risk="UNKNOWN",
            findings=[],
            notes=["LLM 연동 전 더미 응답"],
        )
