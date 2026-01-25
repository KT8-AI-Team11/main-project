from __future__ import annotations

from typing import List, Tuple

import numpy as np
import cv2
from paddleocr import PaddleOCR
from app.schemas.ocr import OcrLine

class PaddleOcrService:
    def __init__(self, lang: str = "korean"):
        self.lang = lang
        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang=lang,
        )

    def _decode_image(self, image_bytes: bytes) -> np.ndarray:
        arr = np.frombuffer(image_bytes, dtype=np.uint8)
        img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if img is None:
            raise ValueError("Failed to decode image bytes")
        return img

    def extract(self, image_bytes: bytes) -> Tuple[str, List[OcrLine]]:
        img = self._decode_image(image_bytes)

        result = self.ocr.ocr(img)

        if not result or not result[0]:
            return "", []

        lines: List[OcrLine] = []
        for item in result[0]:
            box, (text, score) = item[0], item[1]
            lines.append(OcrLine(text=text, score=float(score), box=box))

        full_text = "\n".join([l.text for l in lines])
        return full_text, lines


# --- 싱글턴(프로세스 1개당 1번만 모델 로딩) ---
_ocr_service: PaddleOcrService | None = None


def get_ocr_service(lang: str = "korean") -> PaddleOcrService:
    global _ocr_service
    if _ocr_service is None or _ocr_service.lang != lang:
        _ocr_service = PaddleOcrService(lang=lang)
    return _ocr_service
