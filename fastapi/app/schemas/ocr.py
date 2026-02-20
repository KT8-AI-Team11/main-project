from pydantic import BaseModel
from typing import List


class OcrLine(BaseModel):
    text: str
    score: float
    box: List[List[float]]


class OcrExtractResponse(BaseModel):
    language: str
    text: str
    normalized_text: str
    lines: List[OcrLine]