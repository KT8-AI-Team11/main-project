from __future__ import annotations

import json
from typing import List, Optional, Tuple

from langchain_core.documents import Document

from app.repositories.vectorstore_repo import get_retriever
from app.services.ocr_service import get_ocr_service
from app.services.llm_service import LlmService

from app.schemas.compliance import LlmResult, Finding

def _normalize_text(text: str) -> str:
    return "\n".join([line.strip() for line in (text or "").splitlines() if line.strip()])

def _format_docs_for_context(docs: List[Document], max_chars: int = 8000) -> str:
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

    # 규제 체크용. domain에 따라 라벨 규제와 성분 규제 다르게
    def check_from_text(
        self,
        market: str,
        text: str,
        domain: str = "labeling",
        # k: int = 6,
        # fetch_k: int = 20,
    ):

        normalized = _normalize_text(text)
        if not normalized:
            return LlmResult(overall_risk="LOW", findings=[], notes=["Empty input text."])

        # 1) RAG
        rag_query = _build_rag_query(market=market, domain=domain, text=normalized)
        retriever = get_retriever(market=market, domain=domain, k=6, fetch_k=20)
        docs = retriever.invoke(rag_query)
        context = _format_docs_for_context(docs)

        # 2) LLM (✅ 여기만 너 LlmService에 맞춰 호출 방식 조정)
        # 기존 방식: analyze_label_text(market, text)
        # -> RAG 붙이려면 context까지 넘기는 새 메서드가 필요함
        llm_result = self.llm.analyze_with_context(
            market=market,
            domain=domain,
            text=normalized,
            context=context,
        )
        return llm_result

    # 내부 로직은 ocr에 이미지 넣고 받은 값을 check_from_text까지 처리하는데 실제론 이 두 개를 따로따로할 거임
    # todo: 안쓰일 거 같으니 최종본 때 확인 후 삭제
    def check_from_image_bytes(
        self,
        market: str,
        image_bytes: bytes,
        ocr_lang: str = "korean",
    ) -> Tuple[str, LlmResult]:
        ocr = get_ocr_service(lang=ocr_lang)
        ocr_text, _lines = ocr.extract(image_bytes)
        normalized = _normalize_text(ocr_text)

        llm_result = self.check_from_text(
            market=market,
            text=normalized,
            domain="labeling",
        )
        return normalized, llm_result


_compliance_service: ComplianceService | None = None


def get_compliance_service() -> ComplianceService:
    global _compliance_service
    if _compliance_service is None:
        _compliance_service = ComplianceService()
    return _compliance_service