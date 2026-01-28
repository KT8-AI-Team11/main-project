import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
} from "lucide-react";

import CountryMultiSelect from "../components/CountryMultiSelect";
import { ocrExtract } from "../api/ocr";

// ClaimCheckPage (문구/라벨 규제 확인)
// 1) 이미지 업로드
// 2) OCR 추출 -> 가운데 텍스트 영역 자동 채움(사용자 수정 가능)
// 3) (다음 단계) 국가별 라벨 검사 API 호출

export default function ClaimCheckPage() {
  // ✅ 국가: 미국 / 유럽연합 / 중국 / 일본
  const countryOptions = useMemo(
    () => [
      { code: "US", name: "미국" },
      { code: "EU", name: "유럽연합" },
      { code: "CN", name: "중국" },
      { code: "JP", name: "일본" },
    ],
    []
  );

  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [selectedCountryCodes, setSelectedCountryCodes] = useState([]);

  const [ocrText, setOcrText] = useState("");
  const [ocrPhase, setOcrPhase] = useState("idle"); // idle | loading | done | error
  const [ocrError, setOcrError] = useState("");

  const pickFile = () => fileInputRef.current?.click();

  const onChangeFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setImageFile(f);
    setOcrText("");
    setOcrPhase("idle");
    setOcrError("");

    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  const clearFile = () => {
    setImageFile(null);
    setOcrText("");
    setOcrPhase("idle");
    setOcrError("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runOcr = async () => {
    if (!imageFile) return alert("이미지를 먼저 선택해주세요.");

    try {
      setOcrPhase("loading");
      setOcrError("");

      // ✅ FastAPI OCR 호출 (form-data key=image, query lang=korean)
      const result = await ocrExtract(imageFile, { lang: "korean" });
      
      setOcrText(result.normalized_text);
      setOcrPhase("done");
    } catch (err) {
      setOcrPhase("error");
      setOcrError(err?.message || "OCR 요청 중 오류가 발생했어요.");
    }
  };

  const canRunInspection = selectedCountryCodes.length > 0 && ocrText.trim().length > 0;

  const runInspectionStub = () => {
    // ✅ 다음 단계: Spring /api/ai-inspection/labels 를 국가별로 반복 호출
    alert(
      "다음 단계: 라벨 검사 API 연결\n\n" +
        "- 선택한 국가(US/EU/CN/JP)만큼 반복 호출\n" +
        "- 엔드포인트: POST /api/ai-inspection/labels\n" +
        "- 요청 바디 스펙에 'OCR 텍스트'를 함께 보낼지 백엔드에 확인 필요"
    );
  };

  const statusChip =
    ocrPhase === "idle" ? null : ocrPhase === "loading" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#6b7280" }}>
        <Loader2 size={14} className="cosy-spin" /> OCR 추출 중...
      </span>
    ) : ocrPhase === "done" ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#059669" }}>
        <CheckCircle2 size={14} /> OCR 완료
      </span>
    ) : (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 900, color: "#dc2626" }}>
        <AlertTriangle size={14} /> OCR 실패
      </span>
    );

  return (
    <div className="cosy-page">
      {/* 상단 3패널: 업로드 / OCR 텍스트 / 국가+검사 */}
      <div className="cosy-grid-3">
        {/* 1) 이미지 업로드 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">라벨 이미지 업로드</div>

          <div className="cosy-card" style={{ padding: 14, flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={onChangeFile}
              style={{ display: "none" }}
            />

            {!imageFile ? (
              <div
                onClick={pickFile}
                style={{
                  flex: 1,
                  border: "2px dashed #d1d5db",
                  borderRadius: 12,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  background: "#f9fafb",
                }}
              >
                <UploadCloud size={28} color="#6b7280" />
                <div style={{ fontWeight: 900, fontSize: 13, color: "#111827" }}>
                  이미지를 선택하세요
                </div>
                <div className="cosy-subtext">png / jpg / webp 지원</div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ImageIcon size={18} color="#111827" />
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#111827" }}>
                      {imageFile.name}
                    </div>
                  </div>

                  <button type="button" className="cosy-btn" onClick={clearFile}>
                    제거
                  </button>
                </div>

                <div
                  className="cosy-card"
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    height: 260,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f3f4f6",
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="라벨 미리보기"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : (
                    <div className="cosy-subtext">미리보기를 표시할 수 없어요</div>
                  )}
                </div>

                <div className="cosy-subtext">
                  * 다음 패널에서 “OCR 추출”을 눌러 텍스트로 변환할 수 있어요.
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2) OCR 텍스트 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">OCR 결과 텍스트</div>

          <div className="cosy-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="cosy-subtext">OCR 결과가 자동으로 입력되고, 직접 수정할 수 있어요.</div>
              {statusChip}
            </div>

            {ocrPhase === "error" && (
              <div
                style={{
                  background: "#FEF2F2",
                  border: "1px solid #FCA5A5",
                  color: "#991B1B",
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {ocrError}
              </div>
            )}

            <textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="OCR 추출 결과가 여기 표시됩니다. (원하면 직접 수정 가능)"
              style={{
                width: "100%",
                flex: 1,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                padding: 12,
                resize: "none",
                fontSize: 13,
                lineHeight: 1.5,
                outline: "none",
              }}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                className="cosy-btn cosy-btn--primary"
                onClick={runOcr}
                disabled={!imageFile || ocrPhase === "loading"}
              >
                {ocrPhase === "loading" ? "OCR 추출 중..." : "OCR 추출"}
              </button>
            </div>
          </div>
        </div>

        {/* 3) 국가 선택 + 검사(다음 단계) */}
        <div className="cosy-panel is-relative">
          <div className="cosy-panel__title">검사</div>

          <CountryMultiSelect
            label="대상 국가 선택"
            options={countryOptions}
            value={selectedCountryCodes}
            onChange={setSelectedCountryCodes}
            placeholder="국가를 선택하세요"
          />

          <div className="cosy-mini-actions">
            <button
              type="button"
              className="cosy-btn"
              onClick={() => setSelectedCountryCodes(countryOptions.map((c) => c.code))}
            >
              전체 선택
            </button>

            <button type="button" className="cosy-btn" onClick={() => setSelectedCountryCodes([])}>
              해제
            </button>
          </div>

          <div className="cosy-card cosy-center-box" style={{ minHeight: 220, marginTop: 14 }}>
            <div className="cosy-subtext">
              지금 단계 목표: <b>이미지 업로드 → OCR 호출</b>이 정상인지 확인
            </div>
            <div className="cosy-subtext">
              다음 단계: 선택한 국가별로 Spring 검사 API 호출
            </div>
          </div>

          <button
            type="button"
            className="cosy-btn cosy-btn--primary cosy-submit"
            onClick={runInspectionStub}
            disabled={!canRunInspection}
            title={!canRunInspection ? "국가 선택 + OCR 텍스트가 있어야 실행할 수 있어요" : ""}
          >
            검사 실행
          </button>
        </div>
      </div>
    </div>
  );
}

