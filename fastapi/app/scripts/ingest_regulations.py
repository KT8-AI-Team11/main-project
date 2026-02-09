from __future__ import annotations

import os
import re
from pathlib import Path
from typing import List, Dict, Any

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

from dotenv import load_dotenv
load_dotenv()


BASE_DIR = Path(__file__).resolve().parents[2]  # fastapi/
REGULATIONS_DIR = BASE_DIR / "app" / "data" / "regulations"
INGREDIENTS_DIR = BASE_DIR / "app" / "data" / "ingredients"
CHROMA_DIR = BASE_DIR / "app" / "data" / "chroma"

OPENAI_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")


def load_files(file_paths: List[Path]) -> List:
    docs = []
    for p in file_paths:
        if p.suffix.lower() == ".pdf":
            loader = PyPDFLoader(str(p))
        elif p.suffix.lower() == ".txt":
            loader = TextLoader(str(p), encoding="utf-8")
        else:
            continue
        docs.extend(loader.load())
    return docs


def add_metadata(docs: List, country: str, domain: str) -> List:
    for d in docs:
        source = d.metadata.get("source", "")
        d.metadata.update({
            "country": country,
            "domain": domain,
            "title": Path(source).stem if source else "",
        })
    return docs


def _split_by_record(docs: List) -> List[Document]:
    """제한 원료 텍스트를 [레코드 N] 단위로 분할."""
    chunks: List[Document] = []
    for doc in docs:
        records = re.split(r'\n(?=\[레코드 \d+\])', doc.page_content)
        for rec in records:
            rec = rec.strip()
            if not rec:
                continue
            chunks.append(Document(page_content=rec, metadata=doc.metadata.copy()))
    return chunks


def ingest(country: str, domain: str, target_dir: Path = None):
    if target_dir is None:
        target_dir = REGULATIONS_DIR / country / domain
    files = sorted(target_dir.glob("*.pdf")) + sorted(target_dir.glob("*.txt"))

    if not files:
        raise RuntimeError(f"No PDF/TXT found in: {target_dir}")

    raw_docs = load_files(files)
    raw_docs = add_metadata(raw_docs, country=country, domain=domain)

    if domain == "restricted_ingredients":
        chunks = _split_by_record(raw_docs)
    else:
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
    # 규제 문서
    ingest(country="JP", domain="ingredients")
    ingest(country="JP", domain="labeling")
    ingest(country="US", domain="ingredients")
    ingest(country="US", domain="labeling")
    ingest(country="EU", domain="ingredients")
    ingest(country="EU", domain="labeling")
    ingest(country="CN", domain="ingredients")
    ingest(country="CN", domain="labeling")

    # 사용 제한 원료
    for c in ["JP", "US", "EU", "CN"]:
        target = INGREDIENTS_DIR / c
        if target.exists() and any(target.iterdir()):
            ingest(country=c, domain="restricted_ingredients", target_dir=target)
