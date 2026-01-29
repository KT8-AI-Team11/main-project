import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Minus,
  UploadCloud,
} from "lucide-react";

import CountryMultiSelect from "../components/CountryMultiSelect";
import { ocrExtract } from "../api/ocr";

// ClaimCheckPage (문구/라벨 규제 확인)
// ✅ chore/ocr: OCR 연동 흐름 유지
// ✅ yg: 하단 결과 UI(요약+테이블) 복구(데모 로직 포함)

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

  // ✅ (yg 결과 UI용) 데모 키워드 룰: 나중에 백엔드 결과로 교체 예정
  const rules = useMemo(
    () => [
      { k: "치료", severity: "high", detail: "의학적 치료 효능 표현 가능성", action: "‘개선에 도움’ 등으로 완화 권장" },
      { k: "완치", severity: "high", detail: "완치/보장 표현(과장/금지 가능)", action: "절대적 표현 제거" },
      { k: "처방", severity: "high", detail: "의료행위 연상 표현", action: "‘케어/관리’로 표현 변경" },
      { k: "살균", severity: "high", detail: "살균/소독 효능 주장", action: "표현 삭제 또는 근거/분류 확인" },
      { k: "소독", severity: "high", detail: "살균/소독 효능 주장", action: "표현 삭제 또는 근거/분류 확인" },
      { k: "항염", severity: "mid", detail: "염증 관련 의학 효능 연상", action: "‘진정’ 등 완화 표현 고려" },
      { k: "항균", severity: "mid", detail: "항균 효능 주장", action: "표현 완화/근거 확인" },
      { k: "즉시 효과", severity: "mid", detail: "즉시/극적 효과(과장 가능)", action: "효과 표현 완화" },
      { k: "100%", severity: "mid", detail: "절대적 보장(과장 가능)", action: "보장/수치 표현 제거" },
      { k: "부작용 없음", severity: "mid", detail: "안전성 절대 표현(과장 가능)", action: "절대 표현 제거" },
      { k: "미백", severity: "mid", detail: "기능성 효능 표현(요건 확인 필요)", action: "근거/표기 요건 확인" },
      { k: "주름 개선", severity: "mid", detail: "기능성 효능 표현(요건 확인 필요)", action: "근거/표기 요건 확인" },
    ],
    []
  );

  // ====== chore/ocr: 이미지 업로드 + OCR 상태 ======
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [selectedCountryCodes, setSelectedCountryCodes] = useState([]);

  const [ocrText, setOcrText] = useState("");
  const [ocrPhase, setOcrPhase] = useState("idle"); // idle | loading | done | error
  const [ocrError, setOcrError] = useState("");

  // ====== yg: 하단 결과 UI 상태 ======
  const [summary, setSummary] = useState(null); // { status: 'pass'|'warn'|'fail', text }
  const [rows, setRows] = useState([]);

  const resetResults = () => {
    setSummary(null);
    setRows([]);
  };

  const pickFile = () => fileInputRef.current?.click();

  const onChangeFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setImageFile(f);
    setOcrText("");
    setOcrPhase("idle");
    setOcrError("");
    resetResults();

    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  const clearFile = () => {
    setImageFile(null);
    setOcrText("");
    setOcrPhase("idle");
    setOcrError("");
    resetResults();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onCountriesChange = (next) => {
    setSelectedCountryCodes(next);
    resetResults();
  };

  const runOcr = async () => {
    if (!imageFile) return alert("이미지를 먼저 선택해주세요.");

    try {
      setOcrPhase("loading");
      setOcrError("");
      resetResults();

      // ✅ FastAPI OCR 호출 (form-data key=image, query lang=korean)
      const result = await ocrExtract(imageFile, { lang: "korean" });

      // ✅ normalized_text 우선 적용
      setOcrText(result.normalized_text ?? result.text ?? "");
      setOcrPhase("done");
    } catch (err) {
      setOcrPhase("error");
      setOcrError(err?.message || "OCR 요청 중 오류가 발생했어요.");
    }
  };

  // ====== 결과 UI(데모) 실행: 나중에 Spring API 호출 결과로 교체 ======
  const runAuditDemo = () => {
    if (!ocrText.trim()) return alert("OCR 결과 텍스트(또는 직접 입력)를 준비해주세요.");
    if (selectedCountryCodes.length === 0) return alert("국가를 선택해주세요.");

    const text = ocrText;

    const hits = [];
    rules.forEach((r) => {
      if (text.includes(r.k)) hits.push(r);
    });

    const score = hits.reduce((acc, h) => acc + (h.severity === "high" ? 3 : 1), 0);
    const status = score >= 6 ? "fail" : score >= 2 ? "warn" : "pass";
    const statusText =
      status === "pass" ? "통과(데모)" : status === "warn" ? "주의(데모)" : "부적합(데모)";

    setSummary({ status, text: statusText });

    const out = [];
    selectedCountryCodes.forEach((c) => {
      const countryName = countryOptions.find((x) => x.code === c)?.name || c;
      hits.forEach((h) => {
        out.push({
          labelName: imageFile ? imageFile.name : "직접 입력",
          countryName,
          badClaim: h.k,
          location: imageFile ? "라벨 이미지(OCR/입력)" : "직접 입력",
          detail: h.detail,
          action: h.action,
          severity: h.severity,
        });
      });
    });

    setRows(out);
  };

  const canRunInspection =
    selectedCountryCodes.length > 0 && ocrText.trim().length > 0;

  const statusChip =
    ocrPhase === "idle" ? null : ocrPhase === "loading" ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 900,
          color: "#6b7280",
        }}
      >
        <Loader2 size={14} className="cosy-spin" /> OCR 추출 중...
      </span>
    ) : ocrPhase === "done" ? (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 900,
          color: "#059669",
        }}
      >
        <CheckCircle2 size={14} /> OCR 완료
      </span>
    ) : (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          fontWeight: 900,
          color: "#dc2626",
        }}
      >
        <AlertTriangle size={14} /> OCR 실패
      </span>
    );

  // ✅ yg 요약 아이콘
  const summaryIcon =
    !summary ? (
      <div className="cosy-circle">
        <Minus size={18} />
      </div>
    ) : summary.status === "pass" ? (
      <div className="cosy-circle" style={{ borderColor: "#6EE7B7" }}>
        <CheckCircle2 size={18} color="#059669" />
      </div>
    ) : (
      <div
        className="cosy-circle"
        style={{
          borderColor: summary.status === "warn" ? "#FCD34D" : "#FCA5A5",
        }}
      >
        <AlertTriangle
          size={18}
          color={summary.status === "warn" ? "#D97706" : "#DC2626"}
        />
      </div>
    );

  return (
    <div className="cosy-page">
      {/* 상단 3패널: 업로드 / OCR 텍스트 / 국가+검사 */}
      <div className="cosy-grid-3">
        {/* 1) 이미지 업로드 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">라벨 이미지 업로드</div>

          <div
            className="cosy-card"
            style={{
              padding: 14,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ImageIcon size={18} color="#111827" />
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#111827",
                      }}
                    >
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
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

          <div
            className="cosy-card"
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div className="cosy-subtext">
                OCR 결과가 자동으로 입력되고, 직접 수정할 수 있어요.
              </div>
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
              onChange={(e) => {
                setOcrText(e.target.value);
                resetResults();
              }}
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

        {/* 3) 국가 선택 + 검사 */}
        <div className="cosy-panel is-relative">
          <div className="cosy-panel__title">검사</div>

          <CountryMultiSelect
            label="대상 국가 선택"
            options={countryOptions}
            value={selectedCountryCodes}
            onChange={onCountriesChange}
            placeholder="국가를 선택하세요"
          />

          <div className="cosy-mini-actions">
            <button
              type="button"
              className="cosy-btn"
              onClick={() => onCountriesChange(countryOptions.map((c) => c.code))}
            >
              전체 선택
            </button>

            <button
              type="button"
              className="cosy-btn"
              onClick={() => onCountriesChange([])}
            >
              해제
            </button>
          </div>

          <div
            className="cosy-card cosy-center-box"
            style={{ minHeight: 220, marginTop: 14 }}
          >
            <div className="cosy-subtext">
              지금 단계 목표: <b>이미지 업로드 → OCR 호출</b>이 정상인지 확인
            </div>
            <div className="cosy-subtext">
              다음 단계: 선택한 국가별로 Spring 검사 API 호출 (결과는 아래 영역에 표시)
            </div>
          </div>

          {/* ✅ 현재는 yg 결과 UI 복구를 위해 "데모 심사"로 연결 */}
          <button
            type="button"
            className="cosy-btn cosy-btn--primary cosy-submit"
            onClick={runAuditDemo}
            disabled={!canRunInspection}
            title={!canRunInspection ? "국가 선택 + OCR 텍스트가 있어야 실행할 수 있어요" : ""}
          >
            검사 실행
          </button>
        </div>
      </div>

      {/* ✅ 하단 결과 UI(yg에서 가져온 영역) */}
      <div style={{ marginTop: 16 }}>
        <div className="cosy-panel is-tall" style={{ minHeight: 360 }}>
          <div className="cosy-panel__title">문구 규제 부적합 요소(데모)</div>

          {/* 요약 */}
          <div className="cosy-card" style={{ padding: 12 }}>
            <div className="cosy-center-box" style={{ minHeight: 120 }}>
              {summaryIcon}
              {!summary ? (
                <div className="cosy-subtext">
                  텍스트와 국가를 준비한 뒤, ‘검사 실행’을 눌러주세요
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
                    {summary.text}
                  </div>
                  <div className="cosy-subtext">
                    * 현재는 데모 판정입니다. (추후 Spring 검사 API 결과로 교체)
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ height: 12 }} />

          {/* 테이블 */}
          <div className="cosy-card">
            <div className="cosy-table-wrap">
              <table className="cosy-table">
                <thead>
                  <tr>
                    <th>라벨명</th>
                    <th>국가명</th>
                    <th>부적합 문구</th>
                    <th>문구 위치</th>
                    <th>상세 규제 내용</th>
                    <th>필요한 작업</th>
                  </tr>
                </thead>

                <tbody>
                  {!summary ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "34px 14px" }}>
                        <div className="cosy-center-box" style={{ minHeight: 120 }}>
                          <div className="cosy-circle">
                            <Minus size={18} />
                          </div>
                          <div className="cosy-subtext">
                            검사를 실행하면 결과가 표시됩니다
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "22px 14px" }}>
                        <div className="cosy-subtext" style={{ fontWeight: 900 }}>
                          부적합 요소가 발견되지 않았습니다. (데모)
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((r, idx) => (
                      <tr key={idx}>
                        <td className="cosy-strong">{r.labelName}</td>
                        <td>{r.countryName}</td>
                        <td>
                          <span
                            className={`cosy-chip ${
                              r.severity === "high" ? "is-high" : "is-mid"
                            }`}
                          >
                            {r.badClaim}
                          </span>
                        </td>
                        <td>{r.location}</td>
                        <td>{r.detail}</td>
                        <td>{r.action}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cosy-hint" style={{ marginTop: 10 }}>
            * 이 결과 영역은 “백엔드 검사 API 응답”으로 교체될 자리입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
