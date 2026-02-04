from __future__ import annotations
from typing import List
import json
from openai import OpenAI
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL
from app.schemas.compliance import LabelingLlmResult, Finding, IngLlmResult, Detail


class LlmService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL

    # 문구규제 페이지에서 바로 쓸 수 있는 텍스트 생성 함수
    def _format_for_ui(self, data: dict) -> str:
        overall = data.get("overall_risk", "MEDIUM")
        findings = data.get("findings", []) or []
        notes = data.get("notes", []) or []

        lines = []
        lines.append(f"규제 검토 결과")
        lines.append(f"종합 리스크: {overall}")
        lines.append("")

        if findings:
            lines.append("문제 항목:")
            for i, f in enumerate(findings, 1):
                snippet = f.get("snippet", "")
                risk = f.get("risk", "MEDIUM")
                reason = f.get("reason", "")
                rewrite = f.get("suggested_rewrite") or ""
                lines.append(f"{i}. ({risk}) {snippet}")
                lines.append(f"   - 사유: {reason}")
                if rewrite:
                    lines.append(f"   - 수정 제안: {rewrite}")
        else:
            lines.append("문제 항목: 없음")

        if isinstance(notes, str):
            notes = [notes]
        if notes:
            lines.append("")
            lines.append("참고/주의:")
            for n in notes:
                lines.append(f"- {n}")

        return "\n".join(lines)

    # 문구 규제 분석
    def analyze_labeling(self, market: str, text: str, context: str) -> LabelingLlmResult:
        prompt = f"""
너는 {market} 화장품 규제 검토를 도와주는 컴플라이언스 전문가다.
검토 범위는 라벨/문구(표시·광고) 규제이다.

아래 [CONTEXT]는 검색된 공식 규정/가이드 원문 발췌이다.
반드시 CONTEXT에 기반해서만 판단하고, 모르면 모른다고 말해라.

[CONTEXT]
{context}

아래 [INPUT]은 제품의 판매에 쓰일 라벨/문구이다.
[INPUT]
{text}

[OUTPUT JSON]
다음 JSON 형태로만 답하라.
{{
  "overall_risk": "LOW|MEDIUM|HIGH",
  "findings": [
    {{
      "snippet": "문제되는 성분/문구 일부",
      "risk": "LOW|MEDIUM|HIGH",
      "reason": "규제 문서명",
      "suggested_rewrite": "대체 문구/수정안(가능하면)"
    }}
  ],
  "notes": ["추가 참고/한계/확인이 필요한 사항"]
}}
""".strip()

        raw = self.generate(prompt)

        # ```json ... ``` 제거 대응
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json\n", "", 1).strip()

        try:
            data = json.loads(cleaned)
        except Exception:
            # 파싱 실패해도 서비스가 안 죽게 방어
            return LabelingLlmResult(
                overall_risk="MEDIUM",
                findings=[],
                notes=[f"Failed to parse LLM JSON. Raw: {raw[:300]}"],
            )

        findings: List[Finding] = []
        for f in data.get("findings", []) or []:
            findings.append(
                Finding(
                    snippet=str(f.get("snippet", "")),
                    risk=str(f.get("risk", "MEDIUM")),
                    reason=str(f.get("reason", "")),
                    suggested_rewrite=(f.get("suggested_rewrite") or None),
                )
            )

        notes_val = data.get("notes", [])
        if isinstance(notes_val, str):
            notes = [notes_val]
        else:
            notes = [str(x) for x in (notes_val or [])]

        formatted_text = self._format_for_ui(data)

        return LabelingLlmResult(
            overall_risk=str(data.get("overall_risk", "MEDIUM")),
            findings=findings,
            notes=notes,
            formatted_text=formatted_text,
        )

    # 전성분 규제 분석
    def analyze_ingredients(self, market: str, ingredients: str,context: str) -> IngLlmResult:
        prompt = f"""
너는 {market} 화장품 "전성분(성분) 규제" 검토를 도와주는 컴플라이언스 전문가다.

아래 [CONTEXT]는 검색된 공식 규정/가이드 원문 발췌이다.
반드시 CONTEXT에 근거해서만 판단하라.
만약 [CONTEXT]가 비어있거나, [CONTEXT]에 해당 국가({market})의
라벨/문구 규제가 없으면 반드시 "근거 부족"으로 판단하고
추론하거나 일반 지식을 사용하지 말아라.

[CONTEXT]
{context}

[INPUT]
아래는 화장품 전성분(성분) 목록이다. (쉼표/줄바꿈으로 구분될 수 있음)
{ingredients}

[OUTPUT JSON]
반드시 아래 JSON 형식으로만 답하라. 다른 텍스트를 절대 출력하지 마라.
- regulation: 규제 "문서명"을 작성 (가능하면 한글 문서명)
- content: 해당 규정의 핵심 내용을 1~2문장으로 요약
- action: 권장 조치(예: "사용 금지/제거", "농도 기준 확인", "표기 변경", "추가 근거 확인")
{{
  "overall_risk": "LOW|MEDIUM|HIGH",
  "details": [
    {{
      "ingredient": "성분명",
      "regulation": "규제 문서명",
      "content": "규정 요약",
      "action": "권장 조치",
      "severity": "LOW|MEDIUM|HIGH"
    }}
  ],
  "notes": ["추가 참고/한계/확인이 필요한 사항"]
}}
""".strip()

        raw = self.generate(prompt)

        # ```json ... ``` 형태 제거
        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json\n", "", 1).strip()

        try:
            data = json.loads(cleaned)
        except Exception:
            return IngLlmResult(
                overall_risk="MEDIUM",
                details=[],
            )

        details: List[Detail] = []
        for d in data.get("details", []) or []:
            details.append(
                Detail(
                    ingredient=str(d.get("ingredient", "")),
                    regulation=str(d.get("regulation", "")),
                    content=str(d.get("content", "")),
                    action=str(d.get("action", "")),
                    severity=str(d.get("severity", "MEDIUM")),
                )
            )

        return IngLlmResult(
            overall_risk=str(data.get("overall_risk", "MEDIUM")),
            details=details,
        )

    def generate(self, prompt: str) -> str:
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
        )
        return resp.choices[0].message.content or ""


_llm: LlmService | None = None


def get_llm_service() -> LlmService:
    global _llm
    if _llm is None:
        _llm = LlmService()
    return _llm