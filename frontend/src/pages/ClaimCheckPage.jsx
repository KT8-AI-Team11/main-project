import React, { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Minus,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";

import CountryMultiSelect from "../components/CountryMultiSelect";

export default function ClaimCheckPage() {
  // ✅ 국가: 미국 / 유럽연합 / 중국 / 일본
  const allCountries = useMemo(
    () => [
      { code: "US", name: "미국" },
      { code: "EU", name: "유럽연합" },
      { code: "CN", name: "중국" },
      { code: "JP", name: "일본" },
    ],
    []
  );

  // 데모용 키워드 룰 (실제 규제는 국가별 DB/RAG로 교체)
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

  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const [ocrStatus, setOcrStatus] = useState("idle"); // idle | loading | done | error
  const [ocrError, setOcrError] = useState("");
  const [labelText, setLabelText] = useState("");
  const [selectedCountries, setSelectedCountries] = useState([]); // code[]

  const [summary, setSummary] = useState(null); // { status: 'pass'|'warn'|'fail', text }
  const [rows, setRows] = useState([]);

  const resetResults = () => {
    setSummary(null);
    setRows([]);
  };

  const onCountriesChange = (next) => {
    setSelectedCountries(next);
    resetResults();
  };

  const cleanupImageUrl = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  };

  const setImage = (file) => {
    if (!file) return;
    cleanupImageUrl();
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setOcrStatus("idle");
    setOcrError("");
    resetResults();
  };

  const removeImage = () => {
    cleanupImageUrl();
    setImageFile(null);
    setImageUrl("");
    setOcrStatus("idle");
    setOcrError("");
    resetResults();
  };

  const demoOcrText = () =>
    [
      "[DEMO OCR 결과]",
      "본 제품은 여드름 치료에 도움을 줍니다.",
      "즉시 효과를 느낄 수 있으며 100% 만족을 보장합니다.",
      "부작용 없음.",
    ].join("\n");

  const runOcr = () => {
    resetResults();

    if (!imageFile) {
      setOcrStatus("error");
      setOcrError("이미지를 업로드하면 OCR을 시도할 수 있어요. (텍스트 직접 입력도 가능)");
      return;
    }

    setOcrStatus("loading");
    setOcrError("");

    // ✅ 프론트 데모: 실제 OCR은 백엔드 또는 OCR 라이브러리 연동 예정
    window.setTimeout(() => {
      setOcrStatus("done");
      setLabelText((prev) => (prev.trim() ? prev : demoOcrText()));
    }, 700);
  };

  const clearText = () => {
    setLabelText("");
    setOcrStatus("idle");
    setOcrError("");
    resetResults();
  };

  const runAudit = () => {
    if (!labelText.trim()) return alert("라벨 텍스트를 입력해주세요.");
    if (selectedCountries.length === 0) return alert("국가를 선택해주세요.");

    const text = labelText;
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
    selectedCountries.forEach((c) => {
      const countryName = allCountries.find((x) => x.code === c)?.name || c;
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
        style={{ borderColor: summary.status === "warn" ? "#FCD34D" : "#FCA5A5" }}
      >
        <AlertTriangle
          size={18}
          color={summary.status === "warn" ? "#D97706" : "#DC2626"}
        />
      </div>
    );

  const readyText = !!labelText.trim();

  return (
    <div className="cosy-page">
      <div className="cosy-container">
        {/* 상단 3패널 */}
        <div className="cosy-grid-3" style={{ gridTemplateColumns: "1.25fr 1.1fr .9fr" }}>
          {/* 라벨 이미지 업로드 */}
          <div className="cosy-panel">
            <div className="cosy-panel__title">라벨 이미지 업로드 (선택)</div>

            <div className="cosy-card cosy-inner">
              <div
                className={`cosy-dropzone ${dragOver ? "is-active" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const f = e.dataTransfer?.files?.[0];
                  if (f) setImage(f);
                }}
              >
                {!imageUrl ? (
                  <>
                    <div className="cosy-circle">
                      <Upload size={18} />
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 13 }}>
                      업로드하지 않아도 됩니다 (텍스트 직접 입력 가능)
                    </div>
                    <div className="cosy-subtext">업로드 시 OCR 자동 추출을 시도합니다</div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setImage(f);
                        e.target.value = "";
                      }}
                    />

                    <button
                      type="button"
                      className="cosy-btn"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                    >
                      <ImageIcon size={16} /> 이미지 선택
                    </button>
                  </>
                ) : (
                  <>
                    <img className="cosy-preview" src={imageUrl} alt="label" />

                    <div style={{ width: "100%", display: "flex", gap: 8, justifyContent: "space-between" }}>
                      <div className="cosy-subtext" style={{ fontWeight: 900 }}>
                        {imageFile?.name}
                      </div>
                      <button
                        type="button"
                        className="cosy-btn"
                        onClick={removeImage}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                        title="이미지 제거"
                      >
                        <X size={16} /> 제거
                      </button>
                    </div>

                    <div style={{ width: "100%", display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        className="cosy-btn"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                      >
                        <RefreshCw size={16} /> 이미지 변경
                      </button>

                      <button
                        type="button"
                        className="cosy-btn"
                        onClick={runOcr}
                        disabled={ocrStatus === "loading"}
                        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
                      >
                        {ocrStatus === "loading" ? "OCR 중..." : "OCR 실행"}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className="cosy-hint">
                * 이미지 업로드는 선택입니다. 텍스트만 입력해도 심사 가능합니다.
              </div>
            </div>
          </div>

          {/* 라벨 텍스트 */}
          <div className="cosy-panel">
            <div className="cosy-panel__title">라벨 텍스트 (OCR + 직접 입력)</div>

            <div className="cosy-card cosy-inner">
              <div className="cosy-toolbar">
                <div className="cosy-toolbar__status">
                  OCR 상태: {ocrStatus === "idle" ? "대기" : ocrStatus === "loading" ? "진행" : ocrStatus === "done" ? "완료" : "오류"}
                </div>

                <div className="cosy-toolbar__right">
                  <button type="button" className="cosy-btn" onClick={clearText}>
                    텍스트 지우기
                  </button>
                  <button
                    type="button"
                    className="cosy-btn"
                    onClick={runOcr}
                    disabled={!imageFile || ocrStatus === "loading"}
                    title={!imageFile ? "이미지를 업로드하면 OCR을 실행할 수 있어요" : ""}
                  >
                    {ocrStatus === "loading" ? "OCR 중..." : "OCR 실행"}
                  </button>
                </div>
              </div>

              {ocrError && <div className="cosy-error">{ocrError}</div>}

              <textarea
                className="cosy-textarea"
                value={labelText}
                onChange={(e) => {
                  setLabelText(e.target.value);
                  resetResults();
                }}
                placeholder="라벨 문구를 여기에 붙여넣거나 직접 작성하세요. (이미지 없이도 가능)"
              />

              <div className="cosy-hint">
                * OCR은 데모입니다. (실서비스: 백엔드 OCR/규제 근거 연동 예정)
              </div>
            </div>
          </div>

          {/* 국가 선택 */}
          <div className="cosy-panel">
            <div className="cosy-panel__title">국가 선택</div>

            <div className="cosy-card cosy-inner">
              <CountryMultiSelect
                label="대상 국가 선택"
                options={allCountries}
                value={selectedCountries}
                onChange={onCountriesChange}
                placeholder="국가를 선택하세요"
              />

              <div className="cosy-mini-actions">
                <button
                  type="button"
                  className="cosy-btn"
                  onClick={() => onCountriesChange(allCountries.map((c) => c.code))}
                >
                  전체 선택
                </button>
                <button type="button" className="cosy-btn" onClick={() => onCountriesChange([])}>
                  해제
                </button>
              </div>

              <div className="cosy-kv">
                <div className="cosy-kv__row">
                  <span className="cosy-kv__label">텍스트 입력</span>
                  <span className={`cosy-kv__value ${readyText ? "" : "is-bad"}`}>
                    {readyText ? "완료" : "필요"}
                  </span>
                </div>
                <div className="cosy-kv__row" style={{ marginTop: 8 }}>
                  <span className="cosy-kv__label">국가 선택</span>
                  <span className={`cosy-kv__value ${selectedCountries.length > 0 ? "" : "is-bad"}`}>
                    {selectedCountries.length > 0 ? `${selectedCountries.length}개` : "필요"}
                  </span>
                </div>
                <div className="cosy-hint" style={{ marginTop: 8 }}>
                  * 심사 결과 요약은 아래 결과 영역에 표시됩니다.
                </div>
              </div>

              <button
                type="button"
                className="cosy-btn cosy-btn--primary cosy-btn--full"
                onClick={runAudit}
                disabled={!readyText || selectedCountries.length === 0}
                style={{ marginTop: "auto" }}
              >
                심사
              </button>
            </div>
          </div>
        </div>

        {/* 하단 결과 */}
        <div className="cosy-panel is-tall" style={{ minHeight: 360 }}>
          <div className="cosy-panel__title">문구 규제 부적합 요소(데모)</div>

          {/* 요약 */}
          <div className="cosy-card" style={{ padding: 12 }}>
            <div className="cosy-center-box" style={{ minHeight: 120 }}>
              {summaryIcon}
              {!summary ? (
                <div className="cosy-subtext">텍스트와 국가를 준비한 뒤, ‘심사’를 눌러주세요</div>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>{summary.text}</div>
                  <div className="cosy-subtext">* 데모 판정입니다. 실제 규정/근거 기반 확인 필요</div>
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
                          <div className="cosy-subtext">심사를 실행하면 결과가 표시됩니다</div>
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
                          <span className={`cosy-chip ${r.severity === "high" ? "is-high" : "is-mid"}`}>
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
        </div>
      </div>
    </div>
  );
}
