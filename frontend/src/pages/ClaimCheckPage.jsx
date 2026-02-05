import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { checkRegulation } from "../api/compliance";
import { saveInspectionLog } from "../api/log";


const COUNTRY_CODES = ["US", "EU", "CN", "JP"];
const SUPPORTED_MARKETS = new Set(COUNTRY_CODES);


function mapOverallRiskToStatus(risk) {
  const r = String(risk || "").toUpperCase();
  if (r === "HIGH") return "FAIL";
  if (r === "MEDIUM") return "WARN";
  if (r === "LOW") return "PASS";
  return "WARN";
}

function mapFindingRiskToSeverity(risk) {
  const r = String(risk || "").toUpperCase();
  if (r === "HIGH") return "FAIL";
  if (r === "MEDIUM") return "WARN";
  return "PASS";
}


function normalizeInspectionResult(apiJson, countryCode) {
  const status = mapOverallRiskToStatus(apiJson?.overall_risk);

  const findings = Array.isArray(apiJson?.findings) ? apiJson.findings : [];
  const violations = findings.map((f, idx) => ({
    key: `${countryCode}-${idx}`,
    severity: mapFindingRiskToSeverity(f?.risk),
    snippet: f?.snippet || "",
    reason: f?.reason || "",
    suggested_rewrite: f?.suggested_rewrite || "",
  }));

  const llmText =
    apiJson?.formatted_text ||
    `[${countryCode}] 결과: ${status}\n` +
      violations
        .map(
          (v) =>
            `- (${v.severity}) ${v.snippet}\n  사유: ${v.reason}\n  수정 제안: ${v.suggested_rewrite}`
        )
        .join("\n");

  return {
    phase: "done",
    status, // PASS/WARN/FAIL
    violations, // highlight 계산에 사용
    llmText,
  };
}

export default function ClaimCheckPage({ initialSelectedProducts, initialSelectedProductIds, navData = [] }) {
  // =========================
  // 1) 국가 옵션
  // =========================
  const countryOptions = useMemo(
    () => [
      { code: "US", name: "미국" },
      { code: "EU", name: "유럽연합" },
      { code: "CN", name: "중국" },
      { code: "JP", name: "일본" },
    ],
    []
  );

  const getCountryName = (code) =>
    countryOptions.find((c) => c.code === code)?.name || code;

  // =========================
  // 2) 상단 3패널 상태
  // =========================
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [ocrText, setOcrText] = useState("");
  const [ocrPhase, setOcrPhase] = useState("idle"); // idle | loading | done | error
  const [ocrMsg, setOcrMsg] = useState("");

  // ✅ 디폴트 자동 선택 없음
  const [selectedCountryCodes, setSelectedCountryCodes] = useState([]);

  // =========================
  // 3) 검사 결과(국가별)
  // =========================
  const [resultsByCountry, setResultsByCountry] = useState({});
  const [inspectionStarted, setInspectionStarted] = useState(false);

  // ✅ “돌아가는 중”을 버튼/패널에 강하게 표시하기 위한 상태
  const [isInspecting, setIsInspecting] = useState(false);
  const [currentInspectingCode, setCurrentInspectingCode] = useState("");

  const [activeTab, setActiveTab] = useState("US");
  const [tabPinned, setTabPinned] = useState(false);

  const resultsRef = useRef(null);

  const hasImage = !!imageFile;
  const hasOcrText = (ocrText || "").trim().length > 0;
  const hasCountries = selectedCountryCodes.length > 0;
  const canRunInspection = hasOcrText && hasCountries;

  const resetAllResults = () => {
    setResultsByCountry({});
    setInspectionStarted(false);
    setTabPinned(false);
    setIsInspecting(false);
    setCurrentInspectingCode("");
  };

  // 선택한 국가가 바뀌면 activeTab이 범위 밖일 수 있어 보정
  useEffect(() => {
    if (selectedCountryCodes.length === 0) return;
    if (!selectedCountryCodes.includes(activeTab)) {
      setActiveTab(selectedCountryCodes[0]);
    }
  }, [selectedCountryCodes, activeTab]);

  const overall = useMemo(() => {
    const codes = selectedCountryCodes || [];
    let total = codes.length;
    let loading = 0;
    let doneCount = 0;
    let pass = 0;
    let warn = 0;
    let fail = 0;

    codes.forEach((c) => {
      const r = resultsByCountry?.[c];
      if (!r) return;

      if (r.phase === "loading") loading++;
      if (r.phase === "done" || r.phase === "error") doneCount++;

      if (r.phase === "done") {
        if (r.status === "PASS") pass++;
        if (r.status === "WARN") warn++;
        if (r.status === "FAIL") fail++;
      }
    });

    return { total, loading, doneCount, pass, warn, fail };
  }, [selectedCountryCodes, resultsByCountry]);

  const allDone =
    inspectionStarted && overall.total > 0 && overall.doneCount === overall.total;

  const progressPct = useMemo(() => {
    if (!inspectionStarted || overall.total <= 0) return 0;
    const pct = Math.round((overall.doneCount / overall.total) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [inspectionStarted, overall.total, overall.doneCount]);

  const highlight = useMemo(() => {
    if (!allDone) return null;

    const codes = selectedCountryCodes || [];
    let failPick = null;
    let warnPick = null;

    codes.forEach((c) => {
      const r = resultsByCountry?.[c];
      if (!r || r.phase !== "done") return;
      const count = Array.isArray(r.violations) ? r.violations.length : 0;

      if (r.status === "FAIL") {
        if (!failPick || count > failPick.count)
          failPick = { code: c, status: "FAIL", count };
      } else if (r.status === "WARN") {
        if (!warnPick || count > warnPick.count)
          warnPick = { code: c, status: "WARN", count };
      }
    });

    return failPick || warnPick || null;
  }, [allDone, selectedCountryCodes, resultsByCountry]);

  useEffect(() => {
    if (!inspectionStarted) return;
    if (tabPinned) return;
    if (!allDone) return;
    if (highlight?.code) setActiveTab(highlight.code);
  }, [inspectionStarted, tabPinned, allDone, highlight]);

  const onTabClick = (code) => {
    setActiveTab(code);
    setTabPinned(true);
  };

  // =========================
  // 4) OCR 연동 (절대 깨지면 안 됨)
  // =========================
  const onPickImage = (file) => {
    if (!file) return;
    setImageFile(file);

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    setOcrText("");
    setOcrPhase("idle");
    setOcrMsg("");

    resetAllResults();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setOcrText("");
    setOcrPhase("idle");
    setOcrMsg("");
    resetAllResults();
  };

  const runOcr = async () => {
    if (!imageFile) return;
    try {
      setOcrPhase("loading");
      setOcrMsg("");

      // ✅ 기존 유지 (OCR이 이미 정상 동작 중인 흐름 보존)
      const res = await ocrExtract(imageFile, "korean"); // key=image, lang=korean
      const normalized = res?.normalized_text || "";
      const text = res?.text || "";

      setOcrText(normalized || text || "");
      setOcrPhase("done");
      setOcrMsg("OCR 완료");

      resetAllResults();
    } catch (e) {
      setOcrPhase("error");
      setOcrMsg(e?.message || "OCR 실패");
    }
  };

  // =========================
  // 5) 검사 실행 (FastAPI: POST /v1/compliance/check-regulation)
  // =========================
  const runInspection = async () => {
    if (!canRunInspection) return;
    if (isInspecting) return; // ✅ 중복 클릭 방지

    setInspectionStarted(true);
    setTabPinned(false);
    setIsInspecting(true);
    setCurrentInspectingCode("");

    try {
      // 1) 선택 국가 초기 상태 세팅
      const initState = {};
      selectedCountryCodes.forEach((c) => {
        if (!SUPPORTED_MARKETS.has(c)) {
          // ❗ 미지원 국가: ERR 대신 PEND로 처리(보기 좋게)
          initState[c] = {
            phase: "done",
            status: "PEND",
            violations: [],
            llmText: `[${c}] 현재 백엔드가 ${Array.from(SUPPORTED_MARKETS).join(
              "/"
            )}만 지원합니다.`,
          };
        } else {
          initState[c] = { phase: "loading", status: "", violations: [], llmText: "" };
        }
      });
      setResultsByCountry(initState);

      // 2) 결과 영역으로 스크롤
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);

      // 3) 국가별 반복 호출 (순차)
      for (let i = 0; i < selectedCountryCodes.length; i++) {
        const c = selectedCountryCodes[i];
        if (!SUPPORTED_MARKETS.has(c)) continue;

        setCurrentInspectingCode(c);

        try {
          const apiJson = await checkRegulation({
            market: c,
            text: ocrText,
          });

          const normalized = normalizeInspectionResult(apiJson, c);
          setResultsByCountry((prev) => ({ ...prev, [c]: normalized }));

          // 데이터 Backend로 전송
          const productId = initialSelectedProductIds?.[0];
          if (productId) {
              const logRequest = {
                  productId: Number(productId),
                  country: c,
                  updateType: "MARKETING",
                  marketingStatus: apiJson.overall_risk || "MEDIUM",
                  // 상세 사유들을 하나로 합쳐서 저장
                  marketingLaw: apiJson.findings?.map(f => `[${f.finding}] ${f.reason}`).join("\n") || "규제 근거 정보 없음",
              };
              await saveInspectionLog(logRequest);
              console.log(`[Log Saved] ${c} 결과가 DB에 기록되었습니다.`);
          }
        } catch (err) {
          setResultsByCountry((prev) => ({
            ...prev,
            [c]: {
              phase: "error",
              status: "",
              violations: [],
              llmText: "",
              error: err?.message || "검사 중 오류가 발생했어요.",
            },
          }));
        }
      }
    } finally {
      setCurrentInspectingCode("");
      setIsInspecting(false);
    }
  };

  const activeResult = resultsByCountry?.[activeTab];

  // =========================
  // 6) UI helpers: 상태 chip
  // =========================
  const getMiniStatusMeta = (code) => {
    if (!inspectionStarted) return null;

    const r = resultsByCountry?.[code];
    if (!r) return { label: "PEND", tone: "pending" };

    if (r.phase === "loading") return { label: "RUN", tone: "loading" };
    if (r.phase === "error") return { label: "ERR", tone: "error" };

    if (r.status === "PEND") return { label: "PEND", tone: "pending" };
    if (r.status === "PASS") return { label: "PASS", tone: "pass", className: "is-pass" };
    if (r.status === "WARN") return { label: "WARN", tone: "warn", className: "is-mid" };
    if (r.status === "FAIL") return { label: "FAIL", tone: "fail", className: "is-high" };

    return { label: r.status || "DONE", tone: "pending" };
  };

  const getChipInlineStyle = (tone) => {
    if (tone === "loading") {
      return { background: "#EFF6FF", borderColor: "#93C5FD", color: "#1D4ED8" };
    }
    if (tone === "error") {
      return { background: "#FFF1F2", borderColor: "#FDA4AF", color: "#BE123C" };
    }
    return { background: "#F9FAFB", borderColor: "#E5E7EB", color: "#6B7280" };
  };

  const renderMiniStatusChips = () => {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {selectedCountryCodes.map((code) => {
          const meta = getMiniStatusMeta(code);
          if (!meta) return null;

          const useInline = !meta.className;
          const chipStyle = useInline ? getChipInlineStyle(meta.tone) : {};

          return (
            <span
              key={code}
              className={`cosy-chip ${meta.className ? meta.className : ""}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                ...chipStyle,
              }}
              title={getCountryName(code)}
            >
              <span style={{ fontWeight: 900 }}>{code}</span>
              <span style={{ fontWeight: 900, opacity: 0.85 }}>{meta.label}</span>
            </span>
          );
        })}
      </div>
    );
  };

  const renderTabBadge = (code) => {
    const meta = getMiniStatusMeta(code);
    if (!inspectionStarted || !meta) return null;

    const useInline = !meta.className;
    const badgeStyle = useInline ? getChipInlineStyle(meta.tone) : {};

    return (
      <span
        className={`cosy-chip ${meta.className ? meta.className : ""}`}
        style={{
          marginLeft: 8,
          padding: "2px 8px",
          fontSize: 11,
          ...badgeStyle,
        }}
      >
        {meta.label}
      </span>
    );
  };

  const renderReadyRow = (label, ok) => {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div className="cosy-subtext" style={{ color: "#111827" }}>
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {ok ? (
            <>
              <CheckCircle2 size={16} color="#16a34a" />
              <div className="cosy-subtext" style={{ color: "#16a34a", fontWeight: 900 }}>
                완료
              </div>
            </>
          ) : (
            <>
              <Minus size={16} color="#9ca3af" />
              <div className="cosy-subtext" style={{ color: "#9ca3af", fontWeight: 900 }}>
                대기
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // =========================
  // 7) Render
  // =========================
  

  return (
    <div className="cosy-page">
      <div className="cosy-grid-3 claim-top-grid">
        {/* 1) 라벨 이미지 업로드 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">라벨 이미지 업로드</div>

          <div
            className="cosy-card claim-upload-card"
            style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ImageIcon size={18} />
                <div style={{ fontWeight: 900, fontSize: 13 }}>
                  {imageFile ? imageFile.name : "이미지를 선택하세요"}
                </div>
              </div>

              {imageFile ? (
                <button type="button" className="cosy-btn" onClick={removeImage}>
                  제거
                </button>
              ) : null}
            </div>

            <div
              className="cosy-card claim-upload-dropzone"
              style={{
                border: "1px dashed #d1d5db",
                borderRadius: 12,
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <label
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexDirection: "column",
                    gap: 10,
                    color: "#6b7280",
                    fontWeight: 900,
                  }}
                >
                  <UploadCloud />
                  <div>클릭해서 업로드</div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => onPickImage(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>

            <div className="cosy-subtext">
              * 다음 패널에서 “OCR 추출”을 눌러 텍스트로 변환할 수 있어요.
            </div>
          </div>
        </div>

        {/* 2) OCR 결과 텍스트 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">OCR 결과 텍스트</div>

          <div
            className="cosy-card claim-ocr-card"
            style={{
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {/* ✅ OCR 헤더 줄바꿈 방지 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
              <div
                className="cosy-subtext"
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title="OCR 결과가 자동으로 입력되고, 직접 수정할 수 있어요."
              >
                OCR 결과가 자동으로 입력되고, 직접 수정할 수 있어요.
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {ocrPhase === "done" ? (
                  <>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <div
                      className="cosy-subtext"
                      style={{ color: "#16a34a", fontWeight: 900, whiteSpace: "nowrap" }}
                    >
                      {ocrMsg || "OCR 완료"}
                    </div>
                  </>
                ) : ocrPhase === "loading" ? (
                  <>
                    <Loader2 size={16} className="cosy-spin" />
                    <div className="cosy-subtext" style={{ fontWeight: 900, whiteSpace: "nowrap" }}>
                      OCR 중...
                    </div>
                  </>
                ) : ocrPhase === "error" ? (
                  <>
                    <AlertTriangle size={16} color="#ef4444" />
                    <div
                      className="cosy-subtext"
                      style={{ color: "#ef4444", fontWeight: 900, whiteSpace: "nowrap" }}
                    >
                      {ocrMsg || "OCR 실패"}
                    </div>
                  </>
                ) : (
                  <>
                    <Minus size={16} color="#9ca3af" />
                    <div
                      className="cosy-subtext"
                      style={{ color: "#9ca3af", fontWeight: 900, whiteSpace: "nowrap" }}
                    >
                      대기
                    </div>
                  </>
                )}
              </div>
            </div>

            <textarea
              value={ocrText}
              onChange={(e) => {
                setOcrText(e.target.value);
                resetAllResults();
              }}
              placeholder="OCR 추출 결과가 여기 표시됩니다. (원하면 직접 수정 가능)"
              className="claim-ocr-textarea"
              style={{
                width: "100%",
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

          {/* ✅ 검사 중에는 국가 선택 UI 잠금 + 약간 투명 */}
          <div style={{ pointerEvents: isInspecting ? "none" : "auto", opacity: isInspecting ? 0.65 : 1 }}>
            <CountryMultiSelect
              label="대상 국가 선택"
              options={countryOptions}
              value={selectedCountryCodes}
              onChange={setSelectedCountryCodes}
              placeholder="국가를 선택하세요"
            />
          </div>

          <div className="cosy-mini-actions" style={{ opacity: isInspecting ? 0.65 : 1 }}>
            <button
              type="button"
              className="cosy-btn"
              disabled={isInspecting}
              onClick={() => setSelectedCountryCodes(countryOptions.map((c) => c.code))}
              style={{ cursor: isInspecting ? "not-allowed" : "pointer" }}
              title={isInspecting ? "검사 중에는 변경할 수 없어요" : ""}
            >
              전체 선택
            </button>

            <button
              type="button"
              className="cosy-btn"
              disabled={isInspecting}
              onClick={() => setSelectedCountryCodes([])}
              style={{ cursor: isInspecting ? "not-allowed" : "pointer" }}
              title={isInspecting ? "검사 중에는 변경할 수 없어요" : ""}
            >
              해제
            </button>
          </div>

          <div className="claim-inspection-grid" style={{ marginTop: 14 }}>
            {/* 왼쪽: 요약 박스 */}
            <div
              className="cosy-card claim-inspection-summary"
              style={{
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {!inspectionStarted ? (
                <div style={{ width: "100%" }}>
                  <div style={{ fontWeight: 900, color: "#111827", marginBottom: 10 }}>
                    준비 상태 체크
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {renderReadyRow("이미지 업로드", hasImage)}
                    {renderReadyRow("OCR 텍스트 준비(추출/직접입력)", hasOcrText)}
                    {renderReadyRow(`국가 선택 (${selectedCountryCodes.length}개)`, hasCountries)}
                  </div>

                  <div style={{ height: 10 }} />

                  <div
                    className="cosy-subtext"
                    style={{
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {canRunInspection
                      ? "준비 완료! 오른쪽 ‘검사 실행’을 누르면 국가별 검사가 시작됩니다."
                      : "위 항목이 모두 ‘완료’가 되면 ‘검사 실행’이 가능합니다."}
                  </div>
                </div>
              ) : (
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: "#111827" }}>
                      검사 진행: {overall.doneCount}/{overall.total} 완료
                    </div>

                    {/* ✅ 더 눈에 띄는 “처리 중” 표시 */}
                    {isInspecting && !allDone ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "4px 10px",
                          borderRadius: 999,
                          background: "#EFF6FF",
                          border: "1px solid #93C5FD",
                          color: "#1D4ED8",
                          fontWeight: 900,
                        }}
                        title="검사가 진행 중입니다"
                      >
                        <Loader2 size={14} className="cosy-spin" />
                        처리 중
                      </div>
                    ) : (
                      <div
                        className="cosy-subtext"
                        style={{
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        처리중 {overall.loading}
                      </div>
                    )}
                  </div>

                  <div style={{ height: 10 }} />
                  {renderMiniStatusChips()}
                  <div style={{ height: 12 }} />

                  {allDone ? (
                    <>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <span className="cosy-chip is-pass">PASS {overall.pass}</span>
                        <span className="cosy-chip is-mid">WARN {overall.warn}</span>
                        <span className="cosy-chip is-high">FAIL {overall.fail}</span>
                      </div>

                      <div style={{ height: 10 }} />

                      {highlight ? (
                        <div
                          className="cosy-subtext"
                          style={{
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          우선 확인: {highlight.code} {highlight.status} ({highlight.count}건)
                        </div>
                      ) : (
                        <div
                          className="cosy-subtext"
                          style={{
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          모든 국가에서 큰 이슈가 발견되지 않았습니다.
                        </div>
                      )}

                      <div
                        className="cosy-subtext"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        자세한 내용은 아래 ‘문구 규제 검사 결과’ 영역에서 국가 탭을 눌러 확인하세요.
                      </div>
                    </>
                  ) : (
                    <div
                      className="cosy-subtext"
                      style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      일부 국가는 아직 처리 중입니다. 완료되는 대로 아래 결과 탭에 반영됩니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 오른쪽: 실행 버튼 */}
            <div
              className="cosy-card claim-inspection-action"
              style={{
                padding: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              {/* 상단 상태 */}
              <div
                className="cosy-subtext"
                style={{
                  fontWeight: 900,
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {isInspecting
                  ? `검사 진행 중 ${overall.doneCount}/${overall.total}`
                  : canRunInspection
                  ? allDone && inspectionStarted
                    ? "완료됨"
                    : "준비됨"
                  : "대기중"}
              </div>

              {/* 현재 처리 국가 */}
              {isInspecting ? (
                <div
                  className="cosy-subtext"
                  style={{
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "#1D4ED8",
                    fontWeight: 900,
                  }}
                  title="현재 처리 중인 국가"
                >
                  {currentInspectingCode
                    ? `현재 ${currentInspectingCode} 처리 중…`
                    : "요청 준비 중…"}
                </div>
              ) : null}

              {/* 버튼 */}
              <button
                type="button"
                className="cosy-btn cosy-btn--primary"
                onClick={runInspection}
                disabled={!canRunInspection || isInspecting}
                style={{
                  width: "100%",
                  minHeight: 36,
                  height: "36",
                  padding: "0px 12px",
                  opacity: !canRunInspection || isInspecting ? 0.65 : 1,
                  cursor: !canRunInspection || isInspecting ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  lineHeight: 1,
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={
                  !canRunInspection
                    ? "국가 선택 + OCR 텍스트가 있어야 실행할 수 있어요"
                    : isInspecting
                    ? "검사 진행 중입니다"
                    : ""
                }
              >
                {isInspecting ? <Loader2 size={16} className="cosy-spin" /> : null}
                {isInspecting
                  ? "검사 중..."
                  : inspectionStarted && allDone
                  ? "다시 검사"
                  : "검사 실행"}
              </button>

              {/* 진행률 바 */}
              {inspectionStarted ? (
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      height: 8,
                      background: "#E5E7EB",
                      borderRadius: 999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: "#1D4ED8",
                        transition: "width 180ms ease",
                      }}
                    />
                  </div>
                  <div
                    className="cosy-subtext"
                    style={{
                      textAlign: "center",
                      marginTop: 6,
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {progressPct}%
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* =========================
         하단 결과(LLM 답변만 + 국가 탭)
      ========================= */}
      <div style={{ marginTop: 16 }} ref={resultsRef}>
        <div className="cosy-panel is-tall" style={{ minHeight: 360 }}>
          <div className="cosy-panel__title">문구 규제 검사 결과</div>

          <div className="cosy-card" style={{ padding: 12 }}>
            {!inspectionStarted ? (
              <div className="cosy-subtext">텍스트와 국가를 준비한 뒤, ‘검사 실행’을 눌러주세요</div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900 }}>선택 국가: {selectedCountryCodes.length}개</div>
                <div className="cosy-subtext">
                  (완료 {overall.doneCount}/{overall.total}, 처리중 {overall.loading})
                </div>

                <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="cosy-chip is-pass">PASS {overall.pass}</span>
                  <span className="cosy-chip is-mid">WARN {overall.warn}</span>
                  <span className="cosy-chip is-high">FAIL {overall.fail}</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 10 }} />

          {/* 국가 탭 */}
          <div className="cosy-card" style={{ padding: 10 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(selectedCountryCodes.length ? selectedCountryCodes : COUNTRY_CODES).map((code) => {
                const isActive = activeTab === code;
                return (
                  <button
                    key={code}
                    type="button"
                    className={`cosy-tab ${isActive ? "is-active" : ""}`}
                    onClick={() => onTabClick(code)}
                    title={tabPinned ? "탭 고정됨(자동 이동 중지)" : "탭 클릭 시 고정됨"}
                  >
                    <span style={{ fontWeight: 900 }}>{getCountryName(code)}</span>
                    <span style={{ fontWeight: 900, opacity: 0.85 }}>({code})</span>
                    {renderTabBadge(code)}
                  </button>
                );
              })}
            </div>

            <div style={{ height: 8 }} />
            <div className="cosy-subtext">
              검사 실행 후 국가별 결과를 확인할 수 있어요. (탭을 클릭하면 자동 이동이 멈춥니다)
            </div>
          </div>

          <div style={{ height: 10 }} />

          {/* LLM 답변만 */}
          <div className="cosy-card" style={{ padding: 14 }}>
            {!inspectionStarted ? (
              <div className="cosy-subtext">아직 검사 전입니다.</div>
            ) : !activeResult ? (
              <div className="cosy-subtext">{getCountryName(activeTab)} 결과가 아직 없습니다.</div>
            ) : activeResult.phase === "loading" ? (
              <div className="cosy-subtext">{getCountryName(activeTab)} 검사 중...</div>
            ) : activeResult.phase === "error" ? (
              <div className="cosy-subtext" style={{ color: "#ef4444" }}>
                {getCountryName(activeTab)} 검사 실패: {activeResult.error}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ fontWeight: 900, fontSize: 14 }}>
                    {getCountryName(activeTab)}({activeTab}) 결과: {activeResult.status}
                  </div>
                  <div className="cosy-subtext" style={{ marginLeft: "auto" }}>
                    * 이 영역은 백엔드 검사 API 응답으로 갱신됩니다.
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>AI 검사 답변(LLM)</div>

                  <textarea
                    value={activeResult.llmText || ""}
                    readOnly
                    style={{
                      width: "100%",
                      minHeight: 180,
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      padding: 12,
                      resize: "vertical",
                      fontSize: 13,
                      lineHeight: 1.55,
                      outline: "none",
                      background: "#f9fafb",
                      whiteSpace: "pre-wrap",
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <div style={{ height: 8 }} />  
        </div>
      </div>
    </div>
  );
}
