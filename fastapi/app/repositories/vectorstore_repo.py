from __future__ import annotations

import os
from typing import List, Dict, Any

from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document


DEFAULT_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "app/data/chroma")
DEFAULT_COLLECTION = os.getenv("CHROMA_COLLECTION", "regulations")
DEFAULT_EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

_vectorstore: Chroma | None = None
_embeddings: OpenAIEmbeddings | None = None
_bm25_cache: dict[tuple[str, str], BM25Retriever] = {}

def _get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(model=DEFAULT_EMBED_MODEL)
    return _embeddings


def get_vectorstore() -> Chroma:
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
    key = (market, domain)
    if key in _bm25_cache:
        bm25 = _bm25_cache[key]
        bm25.k = k
        return bm25

    vs = get_vectorstore()

    docs: list[Document] = []
    offset = 0
    limit = 500

    while True:
        where = {"$and": [{"country": market}, {"domain": domain}]}

        data = vs._collection.get(
            include=["documents", "metadatas"],
            where=where,
            limit=limit,
            offset=offset,
        )

        batch_docs = data.get("documents") or []
        batch_metas = data.get("metadatas") or []

        if not batch_docs:
            break

        for text, meta in zip(batch_docs, batch_metas):
            if not meta:
                continue
            if meta.get("country") == market and meta.get("domain") == domain:
                docs.append(Document(page_content=text, metadata=meta))

        offset += limit

    bm25 = BM25Retriever.from_documents(docs)
    bm25.k = k
    _bm25_cache[key] = bm25
    return bm25

class HybridRetriever:
    def __init__(self, bm25, vector, k: int, bm25_weight: float = 0.45, vector_weight: float = 0.55):
        self.bm25 = bm25
        self.vector = vector
        self.k = k
        self.bm25_weight = bm25_weight
        self.vector_weight = vector_weight

    def invoke(self, query: str) -> List[Document]:
        bm25_k = max(1, int(round(self.k * self.bm25_weight)))
        vec_k  = max(1, int(round(self.k * self.vector_weight)))

        bm25_docs = self.bm25.invoke(query)[:bm25_k]
        vec_docs  = self.vector.invoke(query)[:vec_k]

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
    vs = get_vectorstore()
    vs.persist()
