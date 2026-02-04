# app/scripts/debug_chroma.py
import os
from pathlib import Path
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
load_dotenv()

BASE_DIR = Path(__file__).resolve().parents[2]
CHROMA_DIR = BASE_DIR / "app" / "data" / "chroma"

embeddings = OpenAIEmbeddings(
    model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")
)

db = Chroma(
    collection_name="regulations",
    persist_directory=str(CHROMA_DIR),
    embedding_function=embeddings,
)

docs = db.similarity_search("hexachlorophene", k=5)

print(f"Found {len(docs)} docs")
for d in docs:
    print("----")
    print(d.metadata)
    print(d.page_content[:400])

store = db._collection.get(include=["documents", "metadatas"])  # chroma 내부 컬렉션

hits = []
for doc, meta in zip(store["documents"], store["metadatas"]):
    if "hexachlorophene" in doc.lower():
        hits.append((meta, doc))

print("LEXICAL hits:", len(hits))
for meta, doc in hits[:3]:
    print("----")
    print(meta)
    print(doc[:400])