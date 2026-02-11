import io
import os
import json
import re
from datetime import datetime
from fpdf import FPDF
from app.services.llm_service import get_llm_service

class ReportService:
    def __init__(self):
        self.llm_svc = get_llm_service()

    def _setup_fonts(self, pdf):
        font_dir = os.path.join("app", "static", "fonts")
        pdf.add_font("NanumGothic", "", os.path.join(font_dir, "NanumBarunGothic.ttf"))
        pdf.add_font("NanumGothic", "B", os.path.join(font_dir, "NanumBarunGothicBold.ttf"))


    async def create_pdf_report(self, market, domain, product_name, analysis_data):
        pdf = FPDF()
        pdf.add_page()
        self._setup_fonts(pdf)

        if domain == "labeling":
            return await self._generate_labeling_pdf(pdf, market, product_name, analysis_data)
        elif domain == "ingredients":
            return await self._generate_ingredient_pdf(pdf, market, product_name, analysis_data)

    async def _generate_labeling_pdf(self, pdf, market, product_name, analysis_data):
        report_body = self.llm_svc.generate_labeling_report(analysis_data, domain="labeling")
        sections = [s.strip() for s in report_body.split("[SEP]")]
        
        pdf.set_font("NanumGothic", style="B", size=16)
        pdf.cell(0, 15, txt="화장품 문구 규제 적합성 검토 보고서", ln=True, align='C')
        pdf.ln(10)

        pdf.set_font("NanumGothic", style="B", size=12)
        pdf.cell(0, 8, txt=f"작성일: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='R')
        pdf.cell(0, 8, txt=f"제품명: {product_name}", ln=True)
        pdf.cell(0, 8, txt=f"검토 국가: {market}", ln=True)
        pdf.line(10, pdf.get_y() + 2, 200, pdf.get_y() + 2)
        pdf.ln(10)

        section_titles = [
            "1. 검토 개요 및 종합 판정",
            "2. 세부 위반 항목 및 규제 근거",
            "3. 향후 조치 권고 사항"
        ]

        for i, title in enumerate(section_titles):
            if i < len(sections):
                pdf.set_font("NanumGothic", style="B", size=12)
                pdf.set_text_color(0, 0, 0)
                pdf.cell(0, 10, txt=title, ln=True)
                
                pdf.set_font("NanumGothic", size=9)
                pdf.multi_cell(0, 8, txt=sections[i])
                pdf.ln(8)
        
        pdf.ln(20)
        pdf.set_font("NanumGothic", style="B", size=11)
        pdf.cell(0, 10, txt="(주) Cosy 컴플라이언스 팀", ln=True, align='C')

        return io.BytesIO(pdf.output())

    async def _generate_ingredient_pdf(self, pdf, market, product_name, analysis_data):
        raw_json = self.llm_svc.generate_ingredient_report(analysis_data, domain="ingredients")
        
        pdf.set_font("NanumGothic", style="B", size=16)
        pdf.cell(0, 15, txt="화장품 전성분 안전성 검토 보고서", ln=True, align='C')
        pdf.ln(10)

        llm_data = {}
        try:
            json_match = re.search(r'\{.*\}', raw_json, re.DOTALL)
            if json_match:
                llm_data = json.loads(json_match.group())
        except:
            llm_data = {"summary": "데이터 분석 중입니다.", "conclusion": "상세 내역을 확인하십시오."}

        pdf.set_font("NanumGothic", style="B", size=12)
        pdf.cell(0, 8, txt=f"작성일: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='R')
        pdf.cell(0, 8, txt=f"제품명: {product_name}", ln=True)
        pdf.cell(0, 8, txt=f"검토 국가: {market}", ln=True)
        pdf.line(10, pdf.get_y() + 2, 200, pdf.get_y() + 2)
        pdf.ln(10)

        pdf.set_font("NanumGothic", style="B", size=12)
        pdf.cell(0, 10, txt="[1] 성분 배합 적합성 총평", ln=True)
        pdf.set_font("NanumGothic", size=10)
        pdf.multi_cell(0, 7, txt=llm_data.get("summary", "분석된 요약 정보가 없습니다."))
        pdf.ln(5)

        pdf.set_font("NanumGothic", style="B", size=12)
        pdf.cell(0, 10, txt="[2] 세부 성분별 규제 검토 내역", ln=True)

        with pdf.table(borders_layout="HORIZONTAL_LINES", line_height=8, width=190, col_widths=(50, 65, 15, 60)) as table:
            header_row = table.row()
            pdf.set_font("NanumGothic", style="B", size=9)
            for h in ["성분명(INCI)", "규제 근거", "위험도", "조치 권고"]:
                header_row.cell(h)

            pdf.set_font("NanumGothic", size=9)
            ingredient_list = analysis_data.get('details', []) 
            
            for item in ingredient_list:
                row = table.row()
                row.cell(str(item.get("ingredient", "-")))
                row.cell(str(item.get("regulation", "-")))
                row.cell(str(item.get("severity", "-")))
                row.cell(str(item.get("action", "확인 필요")))

        pdf.ln(5)

        pdf.set_font("NanumGothic", style="B", size=12)
        pdf.cell(0, 10, txt="[3] 종합 의견", ln=True)
        pdf.set_font("NanumGothic", size=10)
        pdf.multi_cell(0, 7, txt=llm_data.get("conclusion", "종합 의견 정보가 없습니다."))

        pdf.ln(20)
        pdf.set_font("NanumGothic", style="B", size=11)
        pdf.cell(0, 10, txt="(주) Cosy 컴플라이언스 팀", ln=True, align='C')

        return io.BytesIO(pdf.output())

_report_service = None
def get_report_service():
    global _report_service
    if _report_service is None:
        _report_service = ReportService()
    return _report_service