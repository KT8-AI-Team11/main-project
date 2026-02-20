from __future__ import annotations

from typing import List, Optional

from langchain.schema import Document

from app.repositories.vectorstore_repo import get_retriever


class RagService:

    def retrieve(
        self,
        market: str,
        domain: str,
        query: str,
        k: int = 6,
        fetch_k: int = 20,
    ) -> List[Document]:
        retriever = get_retriever(
            market=market,
            domain=domain,
            k=k,
            fetch_k=fetch_k,
        )
        docs = retriever.invoke(query)
        return docs


_rag_service: RagService | None = None


def get_rag_service() -> RagService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RagService()
    return _rag_service
