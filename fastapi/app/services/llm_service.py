from __future__ import annotations
from typing import List
import json
from openai import OpenAI
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL
from app.schemas.compliance import LlmResult, Finding

class LlmService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL

    # 문구규제 페이지에서 바로 쓸 수 있는 텍스트 생성 함수
    def _format_for_ui(self, market: str, domain_desc: str, data: dict) -> str:
        overall = data.get("overall_risk", "MEDIUM")
        findings = data.get("findings", []) or []
        notes = data.get("notes", []) or []

        lines = []
        lines.append(f"[{market}] {domain_desc} 규제 검토 결과")
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

    # todo: 성분규제와 문구규제를 나누기?
    def analyze_with_context(self, market: str, domain: str, text: str, context: str) -> LlmResult:
        domain_desc = "전성분(성분) 규제" if domain == "ingredients" else "라벨/문구(표시·광고) 규제"
        input_desc = "화장품에 들어가는 전성분을 나열한 것" if domain == "ingredients" else "제품의 판매에 쓰일 라벨/문구"
        prompt = f"""
너는 {market} 화장품 규제 검토를 도와주는 컴플라이언스 전문가다.
검토 범위는 "{domain_desc}"이다.

아래 [CONTEXT]는 검색된 공식 규정/가이드 원문 발췌이다.
반드시 CONTEXT에 기반해서만 판단하고, 모르면 모른다고 말해라.

[CONTEXT]
{context}

아래 [INPUT]은 {input_desc}이다.
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
      "reason": "왜 문제인지(근거 요약)",
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
            return LlmResult(
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

        formatted_text = self._format_for_ui(market, domain_desc, data)

        return LlmResult(
            overall_risk=str(data.get("overall_risk", "MEDIUM")),
            findings=findings,
            notes=notes,
            formatted_text=formatted_text,
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