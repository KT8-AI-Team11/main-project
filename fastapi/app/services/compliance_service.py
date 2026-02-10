from __future__ import annotations

import re
import json
from typing import List, Optional, Tuple

from langchain_core.documents import Document

from app.repositories.vectorstore_repo import get_retriever
from app.services.llm_service import LlmService

from app.schemas.compliance import LabelingLlmResult, Finding


def _normalize_text(text: str) -> str:
    return "\n".join([line.strip() for line in (text or "").splitlines() if line.strip()])

def _format_docs_for_context(docs: List[Document], max_chars: int = 16000) -> str:
    chunks: List[str] = []
    total = 0
    for i, d in enumerate(docs, start=1):
        meta = d.metadata or {}
        source = meta.get("source") or meta.get("file") or meta.get("url") or "unknown"
        title = meta.get("title") or meta.get("doc_title") or ""
        header = f"[Doc {i}] source={source} title={title}".strip()
        body = (d.page_content or "").strip()
        block = header + "\n" + body

        if total + len(block) > max_chars:
            remain = max_chars - total
            if remain > 200:
                chunks.append(block[:remain])
            break

        chunks.append(block)
        total += len(block) + 2
    return "\n\n---\n\n".join(chunks)


def _build_rag_query(market: str, domain: str, text: str) -> str:
    # domain: "labeling" | "ingredients"
    text = text.strip()
    if domain == "ingredients":
        return f"""다음은 화장품 전성분이다.
{market} 규정 기준으로 금지/제한/조건부 허용 성분을 판단하기 위한 규제 근거 문서를 찾아라.

Ingredients:
{text}""".strip()

    return f"""다음은 화장품 라벨(표시/문구) 텍스트이다.
{market} 라벨/표시/광고 규정 기준으로 금지/주의/오해 소지 표현을 판단하기 위한 규제 근거 문서를 찾아라.

Label text:
{text}""".strip()


def _extract_flagged_ingredients(docs: List[Document]) -> List[str]:
    """제한 원료 레코드에서 표준명/영문명을 추출한다."""
    names: List[str] = []
    for d in docs:
        text = d.page_content or ""
        # 표준명 추출
        m = re.search(r"표준명:\s*(.+)", text)
        if m:
            names.append(m.group(1).strip())
        # 영문명 추출
        m = re.search(r"영문명:\s*(.+)", text)
        if m:
            names.append(m.group(1).strip())
    # 중복 제거, 순서 유지
    seen = set()
    unique: List[str] = []
    for n in names:
        if n not in seen:
            seen.add(n)
            unique.append(n)
    return unique


class ComplianceService:
    def __init__(self):
        self.llm = LlmService()

    # 문구 규제용
    def check_labeling(
        self,
        market: str,
        text: str,
    ):

        normalized = _normalize_text(text)
        if not normalized:
            return LabelingLlmResult(overall_risk="LOW", findings=[], notes=["Empty input text."])

        # 1) RAG
        # 1-1. 벡터db에게 무엇을 물어볼지 쿼리 생성
        rag_query = _build_rag_query(market=market, domain="labeling", text=normalized)
        # 1-2. 벡터db retriever 생성 (벡터db에서 관련 문서 찾아주는 탐색기)
        retriever = get_retriever(market=market, domain="labeling", k=6, fetch_k=20)
        # 1-3. 문서 검색 실행
        docs = retriever.invoke(rag_query)
        # 1-4. LLM에게 전달할 문자열 context 생성
        context = _format_docs_for_context(docs)

        # 2) LLM 호출
        llm_result = self.llm.analyze_labeling(
            market=market,
            text=normalized,
            context=context,
        )
        return llm_result

    # 전성분 규제용 (2단계 검색)
    def check_ingredients(
        self,
        market: str,
        text: str,
    ):

        normalized = _normalize_text(text)
        if not normalized:
            return LabelingLlmResult(overall_risk="LOW", findings=[], notes=["Empty input text."])

        # ── Step 1: 제한 원료 DB에서 문제 성분 탐색 ──
        step1_retriever = get_retriever(
            market=market, domain="restricted_ingredients",
            k=40, fetch_k=80, bm25_weight=0.6, vector_weight=0.4,
        )
        restricted_docs = step1_retriever.invoke(normalized)

        # ── Step 2: 규제 원문 검색 ──
        reg_docs: List[Document] = []
        flagged = _extract_flagged_ingredients(restricted_docs) if restricted_docs else []
        if flagged:
            reg_query = f"{market} 화장품 규제: {', '.join(flagged)}"
            step2_retriever = get_retriever(
                market=market, domain="ingredients", k=6, fetch_k=20,
            )
            reg_docs = step2_retriever.invoke(reg_query)

        # fallback: flagged 성분이 없거나 규제 원문이 부족하면 전체 텍스트로 추가 검색
        if len(reg_docs) < 3:
            fallback_query = _build_rag_query(market=market, domain="ingredients", text=normalized)
            fallback_retriever = get_retriever(
                market=market, domain="ingredients", k=10, fetch_k=40,
            )
            fallback_docs = fallback_retriever.invoke(fallback_query)
            existing = {(d.page_content or "")[:200] for d in reg_docs}
            for d in fallback_docs:
                if (d.page_content or "")[:200] not in existing:
                    reg_docs.append(d)

        # ── Step 3: 두 결과를 분리하여 LLM context 구성 ──
        restricted_context = _format_docs_for_context(restricted_docs)
        regulation_context = _format_docs_for_context(reg_docs)

        # 4) LLM 호출
        llm_result = self.llm.analyze_ingredients(
            market=market,
            ingredients=normalized,
            restricted_context=restricted_context,
            regulation_context=regulation_context,
        )
        return llm_result

_compliance_service: ComplianceService | None = None


def get_compliance_service() -> ComplianceService:
    global _compliance_service
    if _compliance_service is None:
        _compliance_service = ComplianceService()
    return _compliance_service