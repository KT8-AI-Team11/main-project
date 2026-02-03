from __future__ import annotations

import os
from typing import List, Dict, Any

from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document


# ---------------------------
# Config (env)
# ---------------------------
DEFAULT_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "app/data/chroma")
DEFAULT_COLLECTION = os.getenv("CHROMA_COLLECTION", "regulations")
DEFAULT_EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


# ---------------------------
# Singleton instances
# ---------------------------
_vectorstore: Chroma | None = None
_embeddings: OpenAIEmbeddings | None = None
_bm25_cache: dict[tuple[str, str], BM25Retriever] = {}

def _get_embeddings() -> OpenAIEmbeddings:
    """
    Embeddings 싱글턴.
    - OpenAIEmbeddings 사용 (OPENAI_API_KEY 필요)
    """
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(model=DEFAULT_EMBED_MODEL)
    return _embeddings


def get_vectorstore() -> Chroma:
    """
    Chroma VectorStore 싱글턴.
    - persist_directory에 저장된 DB를 열고, 없으면 새로 만듦.
    """
    global _vectorstore
    if _vectorstore is None:
        os.makedirs(DEFAULT_PERSIST_DIR, exist_ok=True)

        _vectorstore = Chroma(
            collection_name=DEFAULT_COLLECTION,
            persist_directory=DEFAULT_PERSIST_DIR,
            embedding_function=_get_embeddings(),
        )
    return _vectorstore


def _get_bm25_retriever(market: str, domain: str, k: int = 6) -> BM25Retriever:
    """
    Chroma에 저장된 문서 중 market/domain에 해당하는 것만 뽑아 BM25 Retriever 생성.
    (최소 도입용: db._collection.get 사용)
    """
    key = (market, domain)
    if key in _bm25_cache:
        bm25 = _bm25_cache[key]
        bm25.k = k
        return bm25

    vs = get_vectorstore()

    # Chroma에서 문서/메타데이터를 가져온 후 Python에서 필터링
    # (Chroma의 get(where=...)가 버전마다 제약이 있어서, 최소 도입에선 안전하게 전체->필터 방식)
    data = vs._collection.get(include=["documents", "metadatas"])
    docs: list[Document] = []

    for text, meta in zip(data["documents"], data["metadatas"]):
        if not meta:
            continue
        if meta.get("country") == market and meta.get("domain") == domain:
            docs.append(Document(page_content=text, metadata=meta))

    bm25 = BM25Retriever.from_documents(docs)
    bm25.k = k

    _bm25_cache[key] = bm25
    return bm25

class HybridRetriever:
    """
    EnsembleRetriever 없이 동작하는 최소 하이브리드 리트리버.
    - BM25 + Vector 결과를 합쳐서 반환
    - invoke(query) 지원
    - weights는 '결과 비율'로 반영(점수 기반 정교 랭킹은 최소 도입에선 생략)
    """

    def __init__(self, bm25, vector, k: int, bm25_weight: float = 0.45, vector_weight: float = 0.55):
        self.bm25 = bm25
        self.vector = vector
        self.k = k
        self.bm25_weight = bm25_weight
        self.vector_weight = vector_weight

    def invoke(self, query: str) -> List[Document]:
        # 각 retriever에서 충분히 가져온 뒤 합치기
        bm25_k = max(1, int(round(self.k * self.bm25_weight)))
        vec_k  = max(1, int(round(self.k * self.vector_weight)))

        bm25_docs = self.bm25.invoke(query)[:bm25_k]
        vec_docs  = self.vector.invoke(query)[:vec_k]

        # 중복 제거 (source/page/content prefix 기준)
        seen = set()
        merged: List[Document] = []
        for d in bm25_docs + vec_docs:
            meta = d.metadata or {}
            key = (
                meta.get("source"),
                meta.get("page"),
                (d.page_content or "")[:200],
            )
            if key in seen:
                continue
            seen.add(key)
            merged.append(d)

        # 만약 합친 결과가 k보다 적으면, 남은 자리는 vector에서 더 채움(선택)
        if len(merged) < self.k:
            extra = self.vector.invoke(query)
            for d in extra:
                meta = d.metadata or {}
                key = (meta.get("source"), meta.get("page"), (d.page_content or "")[:200])
                if key in seen:
                    continue
                seen.add(key)
                merged.append(d)
                if len(merged) >= self.k:
                    break

        return merged[: self.k]

def get_retriever(
    market: str,
    domain: str,
    k: int = 6,
    fetch_k: int = 20,
    search_type: str = "mmr",
    use_hybrid: bool = True,
    bm25_weight: float = 0.45,
    vector_weight: float = 0.55,
):
    """
    market/domain 메타데이터 필터를 포함한 Retriever 반환.
    - 기본: hybrid(BM25 + Vector)
    """

    vs = get_vectorstore()

    meta_filter: Dict[str, Any] = {
        "$and": [
            {"country": market},
            {"domain": domain},
        ]
    }

    vector_search_kwargs = {
        "k": k,
        "fetch_k": fetch_k,
        "filter": meta_filter,
    }

    vector_retriever = vs.as_retriever(
        search_type=search_type,
        search_kwargs=vector_search_kwargs,
    )

    if not use_hybrid:
        return vector_retriever

    bm25_retriever = _get_bm25_retriever(market=market, domain=domain, k=k)

    return HybridRetriever(
        bm25=bm25_retriever,
        vector=vector_retriever,
        k=k,
        bm25_weight=bm25_weight,
        vector_weight=vector_weight,
    )



def persist() -> None:
    """
    명시적으로 디스크에 저장하고 싶을 때 사용.
    (Chroma는 내부적으로 저장되기도 하지만, 안전하게 호출 가능)
    """
    vs = get_vectorstore()
    vs.persist()
