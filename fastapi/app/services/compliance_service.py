from __future__ import annotations

from app.services.ocr_service import get_ocr_service
from app.services.llm_service import LlmService


class ComplianceService:
    def __init__(self):
        self.llm = LlmService()

    def check_from_image_bytes(self, market: str, image_bytes: bytes, ocr_lang: str = "korean"):
        ocr = get_ocr_service(lang=ocr_lang)
        ocr_text, _lines = ocr.extract(image_bytes)

        # OCR 결과 텍스트 정제(최소)
        normalized = "\n".join([line.strip() for line in ocr_text.splitlines() if line.strip()])

        llm_result = self.llm.analyze_label_text(market=market, text=normalized)
        return normalized, llm_result


_compliance_service: ComplianceService | None = None


def get_compliance_service() -> ComplianceService:
    global _compliance_service
    if _compliance_service is None:
        _compliance_service = ComplianceService()
    return _compliance_service
