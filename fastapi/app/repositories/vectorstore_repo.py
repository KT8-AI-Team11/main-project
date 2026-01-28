from __future__ import annotations

import os
from typing import Optional, Dict, Any

from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings


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


def get_retriever(
    market: str,
    domain: str,
    k: int = 6,
    fetch_k: int = 20,
    search_type: str = "mmr",
):
    """
    market/domain 메타데이터 필터를 포함한 Retriever 반환.

    - market: "JP", "HK", "EU", ...
    - domain: "ingredients" | "labeling"
    """
    vs = get_vectorstore()

    # Chroma metadata filter (langchain)
    meta_filter: Dict[str, Any] = {
        "$and": [
            {"country": market},
            {"domain": domain},
        ]
    }

    search_kwargs = {
        "k": k,
        "fetch_k": fetch_k,
        "filter": meta_filter,
    }

    return vs.as_retriever(search_type=search_type, search_kwargs=search_kwargs)


def persist() -> None:
    """
    명시적으로 디스크에 저장하고 싶을 때 사용.
    (Chroma는 내부적으로 저장되기도 하지만, 안전하게 호출 가능)
    """
    vs = get_vectorstore()
    vs.persist()
