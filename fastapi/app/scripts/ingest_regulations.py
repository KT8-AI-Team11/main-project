from __future__ import annotations

import os
from pathlib import Path
from typing import List, Dict, Any

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

from dotenv import load_dotenv
load_dotenv()


BASE_DIR = Path(__file__).resolve().parents[2]  # fastapi/
DATA_DIR = BASE_DIR / "app" / "data" / "regulations"
CHROMA_DIR = BASE_DIR / "app" / "data" / "chroma"

OPENAI_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


def load_pdfs(pdf_paths: List[Path]) -> List:
    docs = []
    for p in pdf_paths:
        loader = PyPDFLoader(str(p))
        docs.extend(loader.load())
    return docs


def add_metadata(docs: List, country: str, domain: str, source: str) -> List:
    for d in docs:
        d.metadata = {
            **(d.metadata or {}),
            "country": country,
            "domain": domain,
            "source": source,
        }
    return docs


def ingest(country: str, domain: str):
    target_dir = DATA_DIR / country / domain
    pdfs = sorted(target_dir.glob("*.pdf"))

    if not pdfs:
        raise RuntimeError(f"No PDF found in: {target_dir}")

    raw_docs = load_pdfs(pdfs)
    raw_docs = add_metadata(raw_docs, country=country, domain=domain, source=str(target_dir))

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=120,
    )
    chunks = splitter.split_documents(raw_docs)

    embeddings = OpenAIEmbeddings(model=OPENAI_MODEL)

    vectordb = Chroma(
        collection_name="regulations",
        persist_directory=str(CHROMA_DIR),
        embedding_function=embeddings,
    )

    vectordb.add_documents(chunks)
    vectordb.persist()

    print(f"[OK] Ingested {len(chunks)} chunks into {CHROMA_DIR} (country={country}, domain={domain})")


if __name__ == "__main__":
    # 예: JP ingredients
    ingest(country="JP", domain="ingredients")
