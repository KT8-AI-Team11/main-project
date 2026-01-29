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

const COUNTRY_CODES = ["US", "EU", "CN", "JP"];

export default function ClaimCheckPage() {
  // =========================
  // 1) 국가 옵션 (최종: US/EU/CN/JP)
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
  // 2) (DEMO용) 키워드 룰
  // =========================
  const demoRules = useMemo(
    () => [
      { key: "미백", label: "미백(Whitening) 표현", severity: "WARN" },
      { key: "주름", label: "주름 개선(Anti-wrinkle) 표현", severity: "WARN" },
      { key: "치료", label: "치료(Treatment) 의학적 표현", severity: "FAIL" },
      { key: "완치", label: "완치(Cure) 의학적 표현", severity: "FAIL" },
      { key: "100%", label: "과장/절대 표현(100%)", severity: "WARN" },
    ],
    []
  );

  // =========================
  // 3) 상단 3패널 상태
  // =========================
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [ocrPhase, setOcrPhase] = useState("idle"); // idle | loading | done | error
  const [ocrMsg, setOcrMsg] = useState("");

  const [selectedCountryCodes, setSelectedCountryCodes] = useState(["US", "EU"]);
  const onCountriesChange = (codes) => setSelectedCountryCodes(codes);

  // =========================
  // 4) 검사 결과 상태(국가별)
  // =========================
  const [resultsByCountry, setResultsByCountry] = useState({});
  const [inspectionStarted, setInspectionStarted] = useState(false);

  // 결과 탭
  const [activeTab, setActiveTab] = useState("US");
  const [tabPinned, setTabPinned] = useState(false); // 사용자가 탭 클릭하면 true로 고정

  // 스크롤/포커스
  const resultsRef = useRef(null);

  // =========================
  // 4-1) 준비상태 체크
  // =========================
  const hasImage = !!imageFile;
  const hasOcrText = (ocrText || "").trim().length > 0;
  const hasCountries = selectedCountryCodes.length > 0;

  const canRunInspection = hasOcrText && hasCountries; // 이미지 없어도 텍스트로만 검사 가능

  // =========================
  // 4-2) 전체 요약 계산
  // =========================
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

  // =========================
  // 4-3) highlight(우선 확인 국가)
  // =========================
  const highlight = useMemo(() => {
    if (!allDone) return null;

    // FAIL 우선, 없으면 WARN
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

  // =========================
  // 4-4) 자동 탭 이동(FAIL > WARN)
  // =========================
  useEffect(() => {
    if (!inspectionStarted) return;
    if (tabPinned) return; // 사용자가 탭 클릭해서 고정하면 자동 이동 X
    if (!allDone) return;

    if (highlight?.code) setActiveTab(highlight.code);
  }, [inspectionStarted, tabPinned, allDone, highlight]);

  // =========================
  // 4-5) 탭 클릭 핸들러(고정)
  // =========================
  const onTabClick = (code) => {
    setActiveTab(code);
    setTabPinned(true);
  };

  // =========================
  // 5) OCR 연동 (절대 깨지면 안 됨)
  // =========================
  const onPickImage = (file) => {
    if (!file) return;
    setImageFile(file);

    const url = URL.createObjectURL(file);
    setImagePreview(url);

    // OCR 결과 초기화
    setOcrText("");
    setOcrPhase("idle");
    setOcrMsg("");

    // 검사 결과 초기화
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

      const res = await ocrExtract(imageFile, "korean"); // ✅ FormData key=image, lang=korean
      // 백엔드 요청: 화면에는 normalized_text 우선 표시
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
  // 6) 검사 실행 (현재는 DEMO)
  // =========================
  const resetAllResults = () => {
    setResultsByCountry({});
    setInspectionStarted(false);
    setTabPinned(false);
  };

  // ✅ 상태를 짧고 보기 좋게: countryName 제거, code + status chip
  const getMiniStatusMeta = (code) => {
    if (!inspectionStarted) return null;

    const r = resultsByCountry?.[code];
    if (!r) return { label: "PEND", tone: "pending" };

    if (r.phase === "loading") return { label: "RUN", tone: "loading" };
    if (r.phase === "error") return { label: "ERR", tone: "error" };

    // done
    if (r.status === "PASS") return { label: "PASS", tone: "pass", className: "is-pass" };
    if (r.status === "WARN") return { label: "WARN", tone: "warn", className: "is-mid" };
    if (r.status === "FAIL") return { label: "FAIL", tone: "fail", className: "is-high" };

    return { label: r.status || "DONE", tone: "pending" };
  };

  const getChipInlineStyle = (tone) => {
    // cosy-chip에 없는 상태들만 inline로 처리
    if (tone === "loading") {
      return { background: "#EFF6FF", borderColor: "#93C5FD", color: "#1D4ED8" };
    }
    if (tone === "error") {
      return { background: "#FFF1F2", borderColor: "#FDA4AF", color: "#BE123C" };
    }
    // pending/default
    return { background: "#F9FAFB", borderColor: "#E5E7EB", color: "#6B7280" };
  };

  const renderMiniStatusChips = () => {
    // ✅ 스크롤 대신 wrap (자동 줄바꿈)
    return (
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {selectedCountryCodes.map((code) => {
          const meta = getMiniStatusMeta(code);
          if (!meta) return null;

          const useInline = !meta.className; // PASS/WARN/FAIL은 cosy-chip variant 사용
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

  const makeDemoResult = (countryCode, text) => {
    const hits = demoRules
      .filter((r) => (text || "").includes(r.key))
      .map((r) => ({
        key: r.key,
        label: r.label,
        severity: r.severity,
      }));

    let status = "PASS";
    if (hits.some((h) => h.severity === "FAIL")) status = "FAIL";
    else if (hits.some((h) => h.severity === "WARN")) status = "WARN";

    return {
      phase: "done",
      status,
      violations: hits,
      llmText: makeDemoLLMText(countryCode, status, hits),
    };
  };

  const makeDemoLLMText = (countryCode, status, hits) => {
    const country = getCountryName(countryCode);
    if (!hits || hits.length === 0) {
      return `[${country} ${countryCode}] 결과: PASS\n- 부적합 요소가 발견되지 않았습니다.`;
    }
    const lines = hits.map((h) => `- (${h.severity}) ${h.label}`).join("\n");
    return `[${country} ${countryCode}] 결과: ${status}\n${lines}\n\n권장: 문구를 보다 보수적으로 수정하세요.`;
  };

  const runInspection = async () => {
    if (!canRunInspection) return;

    setInspectionStarted(true);
    setTabPinned(false); // ✅ 새 검사 시작하면 자동 이동 다시 활성화

    // 1) 선택된 국가를 모두 loading으로 세팅
    const loadingState = {};
    selectedCountryCodes.forEach((c) => {
      loadingState[c] = { phase: "loading", status: "", violations: [], llmText: "" };
    });
    setResultsByCountry(loadingState);

    // 2) 결과 UI로 스크롤
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    // =========================
    // 🚀 TODO(백엔드 연동 포인트)
    // - Spring API (/api/ai-inspection/labels) 호출 결과로
    //   resultsByCountry[countryCode]를 채우면 됩니다.
    // - 여러 국가 선택 시: 프론트에서 국가별 반복 호출(현재 계획)
    // =========================

    // 3) DEMO: 국가별로 0.6초 간격으로 완료되는 척
    for (let i = 0; i < selectedCountryCodes.length; i++) {
      const c = selectedCountryCodes[i];
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 600));

      try {
        const demo = makeDemoResult(c, ocrText);
        setResultsByCountry((prev) => ({ ...prev, [c]: demo }));
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
  };

  // 현재 탭 결과
  const activeResult = resultsByCountry?.[activeTab];

  // =========================
  // 7) 상단 3패널: 업로드 / OCR 텍스트 / 국가+검사
  // =========================
  return (
    <div className="cosy-page">
      <div className="cosy-grid-3 claim-top-grid">
        {/* 1) 라벨 이미지 업로드 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">라벨 이미지 업로드</div>

          <div className="cosy-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
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
              className="cosy-card"
              style={{
                border: "1px dashed #d1d5db",
                borderRadius: 12,
                background: "#f9fafb",
                height: 260,
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

          <div className="cosy-card" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
  }}
>
  {/* 왼쪽 안내 문구: 한 줄 고정 + 말줄임 */}
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

  {/* 오른쪽 상태: 줄바꿈 금지 + 오른쪽 고정 */}
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

            <button type="button" className="cosy-btn" onClick={() => onCountriesChange([])}>
              해제
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 14,
              alignItems: "stretch",
            }}
          >
            {/* 왼쪽: 하얀 박스(진행/요약) */}
            <div
              className="cosy-card"
              style={{
                flex: 1,
                minHeight: 220,
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
                  {/* 진행률(한줄 고정) */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 10,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: "#111827" }}>
                      검사 진행: {overall.doneCount}/{overall.total} 완료
                    </div>
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
                  </div>

                  <div style={{ height: 10 }} />

                  {/* ✅ 국가별 상태: 긴 텍스트 제거 -> 짧은 code+status chip */}
                  {renderMiniStatusChips()}

                  <div style={{ height: 12 }} />

                  {/* 완료 시 요약 */}
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
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      일부 국가는 아직 처리 중입니다. 완료되는 대로 아래 결과 탭에 반영됩니다.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 오른쪽: 검사 실행 버튼(겹침 방지용) */}
            <div
              className="cosy-card"
              style={{
                width: 150,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
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
                {canRunInspection ? "준비됨" : "대기중"}
              </div>

              <button
                type="button"
                className="cosy-btn cosy-btn--primary"
                onClick={runInspection}
                disabled={!canRunInspection}
                title={!canRunInspection ? "국가 선택 + OCR 텍스트가 있어야 실행할 수 있어요" : ""}
                style={{ width: "100%" }}
              >
                검사 실행
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          하단 결과 UI: 전체 요약 + 국가별 탭 + LLM 답변만
         ========================= */}
      <div style={{ marginTop: 16 }} ref={resultsRef}>
        <div className="cosy-panel is-tall" style={{ minHeight: 360 }}>
          <div className="cosy-panel__title">문구 규제 검사 결과</div>

          {/* 1) 전체 요약 */}
          <div className="cosy-card" style={{ padding: 12 }}>
            {!inspectionStarted ? (
              <div className="cosy-subtext">
                텍스트와 국가를 준비한 뒤, ‘검사 실행’을 눌러주세요
              </div>
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

          {/* 2) 국가 탭 */}
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
                    {/* ✅ 긴 텍스트 대신 작은 상태 배지 */}
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

          {/* 3) 탭 상세: LLM 답변만 표시 */}
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
          <div className="cosy-subtext">
            * 멀티국가 결과는 country별 반복 호출 → resultsByCountry에 저장 → 탭에서 출력하는 구조입니다.
          </div>
        </div>
      </div>
    </div>
  );
}
