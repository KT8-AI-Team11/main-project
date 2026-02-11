import io
import os
from datetime import datetime
from fpdf import FPDF
from app.services.llm_service import get_llm_service

class ReportService:
    def __init__(self):
        self.llm_svc = get_llm_service()

    async def create_pdf_report(self, market: str, text: str, domain: str, product_name: str) -> io.BytesIO:
        pdf = FPDF()
        pdf.add_page()
        
        # 한글 폰트 설정
        font_path = os.path.join("app", "static", "fonts", "NanumBarunGothic.ttf")
        pdf.add_font("NanumGothic", "", font_path)
        pdf.add_font("NanumGothicBold", "", os.path.join("app", "static", "fonts", "NanumBarunGothicBold.ttf"))

        if domain == "labeling":
            return await self._generate_labeling_pdf(pdf, market, text, product_name)
        else:
            return await self._generate_ingredient_pdf(pdf, market, text, product_name)
        
    async def _generate_labeling_pdf(self, pdf, market, text, product_name):
        res = self.comp_svc.check_labeling(market, text)
        analysis_data = {
            "market": market,
            "overall_risk": res.overall_risk,
            "findings": [f.__dict__ if hasattr(f, '__dict__') else f for f in res.findings]
        }
        report_body = self.llm_svc.generate_labeling_report(analysis_data, domain="labeling")
       
       # 제목
        pdf.set_font("NanumGothicBold", size=14)
        pdf.cell(0, 15, txt="화장품 규제 적합성 검토 보고서", ln=True, align='C')
        pdf.ln(5)

        # 기본 정보
        pdf.set_font("NanumGothic", size=10)
        pdf.cell(0, 8, txt=f"작성일: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='R')
        pdf.cell(0, 8, txt=f"제품명: {product_name}", ln=True)
        pdf.cell(0, 8, txt=f"검토 국가: {market}", ln=True)
        pdf.line(10, pdf.get_y() + 2, 200, pdf.get_y() + 2) # 구분선
        pdf.ln(10)

        pdf.set_font("NanumGothic", size=11)
        pdf.multi_cell(0, 8, txt=report_body)

        pdf.ln(20)
        pdf.set_font("NanumGothicBold", size=11)
        pdf.cell(0, 10, txt="(주) Cosy 컴플라이언스 팀", ln=True, align='C')

        pdf_out = pdf.output()
        return io.BytesIO(pdf_out)
       
    async def _generate_ingredient_pdf(self, pdf, market, text, product_name):
        """성분 안전성 검토 보고서 생성 (테이블형)"""
        res = self.comp_svc.check_ingredients(market, text)
        analysis_data = {
            "market": market,
            "overall_risk": res.overall_risk,
            "details": [d.__dict__ if hasattr(d, '__dict__') else d for d in res.details]
        }
        
        # LLM 호출 (성분 전용 - JSON 반환)
        raw_json = self.llm_svc.generate_ingredient_report(analysis_data, domain="ingredients")

        # 제목
        pdf.set_font("NanumGothicBold", size=14)
        pdf.cell(0, 15, txt="화장품 전성분 안전성 검토 보고서", ln=True, align='C')
        pdf.ln(5)

        # 기본 정보
        pdf.set_font("NanumGothic", size=10)
        pdf.cell(0, 8, txt=f"작성일: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='R')
        pdf.cell(0, 8, txt=f"제품명: {product_name}", ln=True)
        pdf.cell(0, 8, txt=f"검토 국가: {market}", ln=True)
        pdf.line(10, pdf.get_y() + 2, 200, pdf.get_y() + 2) # 구분선
        pdf.ln(10)

        try:
            # JSON 파싱
            clean_json = raw_json.strip().strip('`').replace('json\n', '', 1)
            data = json.loads(clean_json)

            # [1] 총평
            pdf.set_font("NanumGothicBold", size=12)
            pdf.cell(0, 10, txt="[1] 성분 배합 적합성 총평", ln=True)
            pdf.set_font("NanumGothic", size=10)
            pdf.multi_cell(0, 7, txt=data.get("summary", ""))
            pdf.ln(5)

            # [2] 상세 테이블
            pdf.set_font("NanumGothicBold", size=12)
            pdf.cell(0, 10, txt="[2] 세부 성분별 규제 검토 내역", ln=True)
            
            table_data = [("성분명(INCI)", "규제 근거", "위험도", "조치 권고")]
            for item in data.get("table_rows", []):
                table_data.append((item.get("name", "-"), item.get("regulation", "-"), 
                                   item.get("risk_level", "-"), item.get("action_plan", "-")))

            with pdf.table(borders_layout="HORIZONTAL_LINES", line_height=8, width=190, col_widths=(40, 70, 20, 60)) as table:
                for i, data_row in enumerate(table_data):
                    row = table.row()
                    pdf.set_font("NanumGothicBold" if i == 0 else "NanumGothic", size=9)
                    for datum in data_row:
                        row.cell(datum)
            
            pdf.ln(5)
            # [3] 종합 의견
            pdf.set_font("NanumGothicBold", size=12)
            pdf.cell(0, 10, txt="[3] 종합 의견", ln=True)
            pdf.set_font("NanumGothic", size=10)
            pdf.multi_cell(0, 7, txt=data.get("conclusion", ""))

        except:
            # 파싱 실패 시 일반 텍스트 출력
            pdf.set_font("NanumGothic", size=11)
            pdf.multi_cell(0, 8, txt=raw_json)

        pdf.ln(20)
        pdf.set_font("NanumGothicBold", size=11)
        pdf.cell(0, 10, txt="(주) Cosy 컴플라이언스 팀", ln=True, align='C')
        return io.BytesIO(pdf.output())



_report_service = None
def get_report_service():
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service