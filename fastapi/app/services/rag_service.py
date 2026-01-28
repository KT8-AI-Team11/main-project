from __future__ import annotations

from typing import List, Optional

from langchain.schema import Document

from app.repositories.vectorstore_repo import get_retriever


class RagService:
    """
    RAG 조회 전용 서비스
    - country / domain 기준으로 문서 검색
    """

    def retrieve(
        self,
        market: str,
        domain: str,
        query: str,
        k: int = 6,
        fetch_k: int = 20,
    ) -> List[Document]:
        """
        규제 문서 검색

        market: "JP", "HK", "EU", ...
        domain: "ingredients" | "labeling"
        query : LLM에 던질 질문(전성분 텍스트 or OCR 문구 기반 질문)
        """

        retriever = get_retriever(
            market=market,
            domain=domain,
            k=k,
            fetch_k=fetch_k,
        )

        # LangChain 최신 스타일
        docs = retriever.invoke(query)

        return docs


# ---- 싱글턴 ----
_rag_service: RagService | None = None


def get_rag_service() -> RagService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RagService()
    return _rag_service
