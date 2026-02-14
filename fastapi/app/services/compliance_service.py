from __future__ import annotations

from typing import List

import redis, os
from app.services.query_expander import QueryExpander
from langchain_core.documents import Document

from app.repositories.vectorstore_repo import get_retriever
from app.services.llm_service import LlmService

from app.schemas.compliance import LabelingLlmResult


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


class ComplianceService:
    def __init__(self):
        self.llm = LlmService()
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", "6379"))
        r = redis.Redis(host=host, port=port, decode_responses=True)
        self.expander = QueryExpander(redis_client=r, llm_service=self.llm, max_llm_calls_per_request=2)

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

    # 전성분 규제용
    def check_ingredients(
        self,
        market: str,
        text: str,
    ):

        normalized = _normalize_text(text)
        if not normalized:
            return LabelingLlmResult(overall_risk="LOW", findings=[], notes=["Empty input text."])

        # 1) RAG
        rag_query = _build_rag_query(market=market, domain="ingredients", text=normalized)
        expanded_query = self.expander.expand_ingredients_query(rag_query, ingredients_text=normalized)
        retriever = get_retriever(market=market, domain="ingredients", k=15, fetch_k=60, bm25_weight=0.8, vector_weight=0.2,)
        docs = retriever.invoke(expanded_query)
        context = _format_docs_for_context(docs)

        # 2) LLM 호출
        llm_result = self.llm.analyze_ingredients(
            market=market,
            ingredients=normalized,
            context=context,
        )
        return llm_result

_compliance_service: ComplianceService | None = None


def get_compliance_service() -> ComplianceService:
    global _compliance_service
    if _compliance_service is None:
        _compliance_service = ComplianceService()
    return _compliance_service