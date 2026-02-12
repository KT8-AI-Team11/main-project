from __future__ import annotations
from typing import List
import json
from openai import OpenAI
from app.core.config import OPENAI_API_KEY, OPENAI_MODEL, REFLECTION_MODEL
from app.schemas.compliance import LabelingLlmResult, Finding, IngLlmResult, Detail

REFLECTION_THRESHOLD = 7  # 이 점수 미만이면 재생성


class LlmService:
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)
        self.model = OPENAI_MODEL
        self.reflection_model = REFLECTION_MODEL  # .env의 REFLECTION_MODEL로 변경 가능

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

[NOTE]
추가 정보가 필요할 경우 무조건 risk는 LOW로 표시한다.
항목 중 하나라도 risk가 MEDIUM 또는 HIGH라면 overall_risk는 LOW가 될 수 없다. 
입력받은 모든 항목에 대한 내용을 표시해라. 
규제 조항과 해당하는 법적 근거를 반드시 명시해라.
조항명은 원어 그대로 표기해도 되지만, reason, suggested_rewrite, notes 등 나머지 텍스트는 반드시 한글로만 작성해라.


[OUTPUT JSON]
다음 JSON 형태로만 답하라.

{{
  "overall_risk": "LOW|MEDIUM|HIGH",
  "findings": [
    {{
      "snippet": "문제되는 성분/문구 일부",
      "risk": "LOW|MEDIUM|HIGH",
      "reason": "[규제 문서/조항명]에 따르면, '해당 문구'는 ~에 해당하여 위반됩니다.",
      "suggested_rewrite": "대체 문구/수정안(가능하면)"
    }}
  ],
  "notes": ["INPUT 문구에 대한 추가 참고/한계/확인이 필요한 사항만 작성. NOTE의 지시사항을 그대로 옮기지 마라."]
}}


""".strip()

        raw = self._generate_with_reflection(prompt, context) # reflection이 없는걸 원할 경우 여기를 변경

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
    def analyze_ingredients(self, market: str, ingredients: str, context: str) -> IngLlmResult:
        prompt = f"""
너는 {market} 화장품 "전성분(성분) 규제" 검토를 도와주는 컴플라이언스 전문가다.

아래 [CONTEXT]는 검색된 공식 규정/가이드 원문 발췌이다.
반드시 CONTEXT에 근거해서만 판단하라.
만약 [CONTEXT]가 비어있거나, [CONTEXT]에 해당 국가({market})의
성분 규제 근거가 없으면 반드시 "근거 부족"으로 판단하고
추론하거나 일반 지식을 사용하지 말아라.

[CONTEXT]
{context}

[INPUT]
아래는 화장품 전성분(성분) 목록이다. (쉼표/줄바꿈으로 구분될 수 있음)
{ingredients}

[NOTE]
추가 정보가 필요할 경우 무조건 risk는 LOW로 표시한다.
입력받은 모든 성분에 대한 내용을 details에 빠짐없이 표시해라.
규제 근거를 찾지 못한 성분도 반드시 details에 포함하고, severity를 "LOW", regulation을 "근거 부족"으로 표시해라.
어떤 경우에도 INPUT의 성분을 details에서 생략하지 마라.
조항명은 원어 그대로 표기해도 되지만, content, action, notes 등 세부 내용은 반드시 한글로만 작성해라.

[OUTPUT JSON]
반드시 아래 JSON 형식으로만 답하라. 다른 텍스트를 절대 출력하지 마라.
- regulation: 규제 "문서명/조항명"을 작성 (조항명은 원어 허용)
- content: 해당 규정의 핵심 내용을 1~2문장으로 요약한다. 반드시 한글로만 작성한다.
- action: 권장 조치(예: "사용 금지/제거", "농도 기준 확인", "표기 변경", "추가 근거 확인"). 반드시 한글로만 작성한다.
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

        raw = self._generate_with_reflection(prompt, context) # reflection 적용

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
    
    # ========================================================
    # 보고서 생성용 함수 (ReportService에서 호출)
    # ========================================================
    def generate_labeling_report(self, analysis_data: dict, domain: str) -> str:
        findings = analysis_data.get('findings', [])
        content_section = "\n".join([
            f"- 검토 항목: {f.get('snippet')}\n  위험도: {f.get('risk')}\n  위반 사유: {f.get('reason')}\n  수정 제안: {f.get('suggested_rewrite') or '없음'}"
            for f in findings
        ])
        prompt = f"""
당신은 화장품 문구 법률 가이드라인 전문가입니다. [문구 규제 검토] 결과 보고서의 본문 내용만 작성하세요.
검토 범위는 라벨/문구(표시·광고) 규제이다.
절대 마크다운 기호(##, **, - 등)를 사용하지 마세요.

[지시사항]
1. 문체: 매우 정중하고 격식 있는 비즈니스 한국어 문체를 사용하십시오.
2. 구성: 아래 3가지 섹션의 '내용'만 작성하고, 각 섹션 사이에는 반드시 [SEP] 라는 문자를 넣으세요.
   - 첫 번째 섹션: 검토 개요 및 종합 판정
   - 두 번째 섹션: 세부 위반 항목 및 규제 근거 (데이터를 바탕으로 상세히 서술)
   - 세 번째 섹션: 향후 조치 권고 사항
3. 각 섹션은 제목 없이 오직 본문 텍스트로만 시작해야 합니다.
4. 섹션 사이의 구분자는 반드시 [SEP]를 사용하세요.
5. 주의: '보고서 제목'이나 '소제목' 자체를 텍스트로 출력하지 마세요. 오직 본문만 작성하세요.

[데이터]
검토 국가: {analysis_data.get('market')}
종합 리스크: {analysis_data.get('overall_risk')}
세부 내역: {content_section}

보고서 본문 텍스트만 출력하세요. 각 섹션 구분은 [SEP]를 사용하세요.
""".strip()
        return self.generate(prompt)
    
    def generate_ingredient_report(self, analysis_data: dict, domain: str) -> str:
        details = analysis_data.get('details', [])
        market = analysis_data.get('')
        content_section = "\n".join([
            f"- 성분명: {d.get('ingredient')}\n  규제근거: {d.get('regulation')}\n  내용: {d.get('content')}\n  조치사항: {d.get('action')}\n  위험도: {d.get('severity')}"
            for d in details
        ])

        prompt = f"""
당신은 글로벌 화장품 규제 준수(Regulatory Compliance) 전문가입니다. 
제시된 [분석 데이터]를 바탕으로 {market} 국가의 화장품 법령에 의거한 성분 안전성 검토 보고서를 작성하세요.

[지시사항]
1. 국가별 특수성 반영: {market}의 최신 화장품 규제 표준(예: EU의 경우 Annex III/VI, 미국의 경우 MoCRA 등)의 관점에서 분석하세요.
2. 전문 용어 사용: '배합 한도(Restricted)', '사용 금지(Prohibited)', '살균보존제(Preservatives)' 등 업계 전문 용어를 사용하세요.
3. 데이터 요약: 텍스트로 구구절절 설명하지 말고, 표(Table)에 들어갈 수 있도록 각 성분의 위반 사항과 근거 법령을 명확히 요약하세요.
4. 출력 형식: 반드시 아래 JSON 구조로만 응답하세요.

[데이터]
- 검토 국가: {market}
- 성분 리스크 내역: {analysis_data['details']}

[응답 JSON 형식]
{{
  "summary": "해당 국가 규정 대비 전체적인 제품의 적합성 총평 (3줄 이내)",
  "table_rows": [
    {{
      "name": "성분명(INCI)",
      "regulation": "해당 국가의 구체적인 규제 근거 및 법적 조항",
      "risk_level": "위험도 (HIGH/MEDIUM/LOW)",
      "action_plan": "R&D 또는 생산 부서에서 취해야 할 즉각적인 조치"
    }}
  ],
  "conclusion": "해당 시장 진출 가능 여부 및 최종 전문가 의견"
}}
"""
        return self.generate(prompt)

    def _call_llm(self, prompt: str, model: str | None = None) -> str:
        resp = self.client.chat.completions.create(
            model=model or self.model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0,
            max_tokens=16384,
        )
        return resp.choices[0].message.content or ""

    def generate(self, prompt: str) -> str:
        return self._call_llm(prompt, model=self.model)

    # for reflection

    def _reflect(self, original_prompt: str, response: str, context: str) -> dict:
        """
        LLM 응답을 평가하여 score(1~10)와 feedback을 반환한다.
        """
        reflect_prompt = f"""
너는 화장품 규제 분석 결과를 평가하는 품질 검증 전문가다.

아래 [CONTEXT]는 RAG로 검색된 규제 원문이고,
[PROMPT]는 분석 요청, [RESPONSE]는 LLM이 생성한 답변이다.

다음 기준으로 답변 품질을 1~10점으로 평가하라:
1. CONTEXT 근거: CONTEXT에 없는 내용을 지어내지 않았는가? (hallucination 체크)
2. JSON 형식: 요청된 JSON 스키마를 정확히 따르는가?
3. 구체성: findings/details의 reason, regulation 등이 구체적이고 한국어로 작성되어있는가?
4. 완전성: INPUT에서 검토해야 할 항목을 빠뜨리지 않았는가?
5. 일관성: overall_risk와 개별 항목의 risk/severity가 논리적으로 일관되는가?
6. 한글 작성: 모든 텍스트 필드(reason, snippet, suggested_rewrite, notes, regulation, content, action 등)가 한글로 작성되어 있는가?
한글 이외의 언어(영어, 중국어, 일본어 등)로 작성된 부분이 있으면 감점한다.
 
[CONTEXT]
{context}

[PROMPT]
{original_prompt}

[RESPONSE]
{response}

반드시 아래 JSON 형식으로만 답하라:
{{
  "score": 1~10 사이 정수,
  "feedback": "개선이 필요한 구체적 사항. 점수가 7 이상이면 빈 문자열."
}}
""".strip()

        raw = self._call_llm(reflect_prompt, model=self.reflection_model)

        cleaned = raw.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.replace("json\n", "", 1).strip()

        try:
            result = json.loads(cleaned)
            score = int(result.get("score", 5))
            feedback = str(result.get("feedback", ""))
        except Exception:
            score = 5
            feedback = "Reflection 파싱 실패 — 재생성 권장"

        return {"score": score, "feedback": feedback}

    def _generate_with_reflection(self, prompt: str, context: str) -> str:
        """
        1차 생성 → reflection 평가 → 점수 미달 시 피드백 포함 재생성 (최대 1회).
        """
        # 1차 생성
        first_response = self.generate(prompt)

        # 평가
        reflection = self._reflect(
            original_prompt=prompt,
            response=first_response,
            context=context,
        )

        if reflection["score"] >= REFLECTION_THRESHOLD:
            return first_response

        # 재생성: 피드백을 포함한 보강 프롬프트
        retry_prompt = f"""
{prompt}

[이전 답변에 대한 품질 피드백]
아래는 이전 답변에 대한 검증 결과이다. 이 피드백을 반영하여 개선된 답변을 생성하라.
- 점수: {reflection["score"]}/10
- 피드백: {reflection["feedback"]}

위 피드백을 반영하여, 동일한 JSON 형식으로 개선된 답변을 다시 작성하라.
단, 피드백 내용 자체를 notes에 포함하지 마라. notes에는 규제 검토와 관련된 참고사항만 작성하라.
""".strip()

        return self.generate(retry_prompt)


_llm: LlmService | None = None


def get_llm_service() -> LlmService:
    global _llm
    if _llm is None:
        _llm = LlmService()
    return _llm