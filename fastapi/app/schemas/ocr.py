from pydantic import BaseModel
from typing import List


class OcrLine(BaseModel):
    text: str
    score: float
    box: List[List[float]]  # [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]


class OcrExtractResponse(BaseModel):
    language: str
    text: str               # 전체 OCR 텍스트
    lines: List[OcrLine]    # 줄 단위 결과
