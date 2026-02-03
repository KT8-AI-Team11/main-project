import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, Loader2, AlertTriangle } from "lucide-react";
import CountryMultiSelect from "../components/CountryMultiSelect";
import { checkIngredients } from "../api/compliance";
import { useProducts } from "../store/ProductsContext";

const COUNTRY_OPTIONS = [
  { code: "US", name: "미국" },
  { code: "EU", name: "유럽연합" },
  { code: "CN", name: "중국" },
  { code: "JP", name: "일본" },
];

const countryNameOf = (code) =>
  COUNTRY_OPTIONS.find((c) => c.code === code)?.name || code;

const normStr = (v) => (v == null ? "" : String(v)).trim();

const riskRank = (r) => {
  const v = String(r || "").toUpperCase();
  if (v === "HIGH") return 3;
  if (v === "MEDIUM" || v === "MID") return 2;
  if (v === "LOW") return 1;
  return 0;
};

const worstRisk = (a, b) => (riskRank(a) >= riskRank(b) ? a : b);

/** ✅ 신호등 색상(빨/노/초) */
const SEVERITY_META = {
  HIGH: { bg: "#FEE2E2", fg: "#991B1B", bd: "#FCA5A5" }, // red
  MEDIUM: { bg: "#FEF3C7", fg: "#92400E", bd: "#FCD34D" }, // yellow
  LOW: { bg: "#DCFCE7", fg: "#166534", bd: "#86EFAC" }, // green
};

const normSeverity = (v) => {
  const s = String(v || "").toUpperCase();
  if (s === "MID") return "MEDIUM";
  if (s === "HIGH" || s === "MEDIUM" || s === "LOW") return s;
  return "";
};

const SeverityPill = ({ value }) => {
  const sev = normSeverity(value);
  const meta = SEVERITY_META[sev];
  if (!meta) {
    return (
      <span
        className="cosy-chip"
        style={{
          background: "#F3F4F6",
          color: "#374151",
          border: "1px solid #E5E7EB",
          fontWeight: 1000,
        }}
      >
        -
      </span>
    );
  }
  return (
    <span
      className="cosy-chip"
      style={{
        background: meta.bg,
        color: meta.fg,
        border: `1px solid ${meta.bd}`,
        fontWeight: 1000,
      }}
    >
      {sev}
    </span>
  );
};

export default function IngredientCheckPage({
  // (선택) ProductsPage → 이동 시 넘겨줄 수 있는 초기값들(있으면 자동 선택)
  initialSelectedProductIds = null,
  initialSelectedProducts = null, // 현재는 표시용으로만 쓰고 로직 영향 없음(호환 유지)
}) {
  const { products: ctxProducts = [] } = useProducts();
  const resultsRef = useRef(null);

  // ---------- products source (context + localStorage fallback) ----------
  const storageProducts = useMemo(() => {
    try {
      const v = localStorage.getItem("cosy_selected_products");
      const arr = v ? JSON.parse(v) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, []);

  const mergedProducts = useMemo(() => {
    const map = new Map();
    [...storageProducts, ...ctxProducts].forEach((p) => {
      if (!p) return;
      const id = p.id ?? p.productId ?? p._id ?? p.name; // 마지막 fallback
      if (!id) return;
      map.set(String(id), {
        id: String(id),
        name: p.name ?? p.productName ?? "제품",
        // ✅ ProductsPage 저장 필드(fullIngredient)까지 포함
        ingredients: p.fullIngredient ?? p.ingredients ?? p.ing ?? "",
        imageUrl: p.imageUrl ?? p.image ?? null,
        raw: p,
      });
    });
    return Array.from(map.values());
  }, [ctxProducts, storageProducts]);

  const productById = useMemo(() => {
    const m = new Map();
    mergedProducts.forEach((p) => m.set(String(p.id), p));
    return m;
  }, [mergedProducts]);

  // ---------- selection state ----------
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [query, setQuery] = useState("");
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  const [selectedCountries, setSelectedCountries] = useState([]);
  const [inspecting, setInspecting] = useState(false);

  // progress
  const [progressPct, setProgressPct] = useState(0);
  const [progressText, setProgressText] = useState("");

  // results map: key = `${productId}__${countryCode}`
  const [comboResults, setComboResults] = useState({}); // { key: { ok, data, error } }
  const [hasRun, setHasRun] = useState(false);

  // ---------- init selection from props/localStorage ----------
  useEffect(() => {
    const fromProps =
      Array.isArray(initialSelectedProductIds) && initialSelectedProductIds.length > 0
        ? initialSelectedProductIds.map(String)
        : null;

    let fromStorage = null;
    try {
      const v = localStorage.getItem("cosy_selected_product_ids");
      const arr = v ? JSON.parse(v) : [];
      if (Array.isArray(arr) && arr.length > 0) fromStorage = arr.map(String);
    } catch {
      // ignore
    }

    const next = fromProps || fromStorage;
    if (next && next.length > 0) {
      setSelectedProductIds((prev) => (prev.length ? prev : next));
      return;
    }

    // 아무 것도 없으면 1개 기본 선택(있을 때)
    if (mergedProducts.length > 0) {
      setSelectedProductIds((prev) => (prev.length ? prev : [String(mergedProducts[0].id)]));
    }
  }, [initialSelectedProductIds, mergedProducts]);

  // ---------- derived lists ----------
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = mergedProducts.filter((p) => {
      if (!q) return true;
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.ingredients || "").toLowerCase().includes(q)
      );
    });
    if (!showSelectedOnly) return base;
    const set = new Set(selectedProductIds);
    return base.filter((p) => set.has(String(p.id)));
  }, [mergedProducts, query, showSelectedOnly, selectedProductIds]);

  const selectedProducts = useMemo(() => {
    const set = new Set(selectedProductIds);
    return mergedProducts.filter((p) => set.has(String(p.id)));
  }, [mergedProducts, selectedProductIds]);

  const totalTasks = useMemo(() => {
    const p = selectedProductIds.length;
    const c = selectedCountries.length;
    return p * c;
  }, [selectedProductIds.length, selectedCountries.length]);

  const doneTasks = useMemo(() => Object.keys(comboResults).length, [comboResults]);

  const status = useMemo(() => {
    if (inspecting) return { text: "검사 중…", cls: "is-running" };
    if (hasRun) return { text: "완료", cls: "is-done" };
    return { text: "대기", cls: "" };
  }, [hasRun, inspecting]);

  // ---------- table rows ----------
  const tableRows = useMemo(() => {
    const rows = [];
    Object.entries(comboResults).forEach(([key, v]) => {
      const [pid, market] = key.split("__");
      const product = productById.get(pid);
      const productName = product?.name || "제품";
      const countryName = countryNameOf(market);

      if (!v?.ok) {
        if (v?.error) {
          rows.push({
            key: `${key}__error`,
            productName,
            countryName,
            ingredient: "-",
            regulation: "-",
            content: v.error,
            action: "재시도 권장",
            severity: "HIGH",
          });
        }
        return;
      }

      const data = v.data || {};
      const details = Array.isArray(data.details) ? data.details : [];
      if (details.length === 0) return;

      details.forEach((d, idx) => {
        rows.push({
          key: `${key}__${idx}`,
          productName,
          countryName,
          ingredient: normStr(d.ingredient),
          regulation: normStr(d.regulation),
          content: normStr(d.content),
          action: normStr(d.action),
          severity: String(d.severity || data.overall_risk || "").toUpperCase(),
        });
      });
    });
    return rows;
  }, [comboResults, productById]);

  // ---------- summary ----------
  const summary = useMemo(() => {
    let overall = "LOW";
    let high = 0;
    let mid = 0;
    let low = 0;

    Object.values(comboResults).forEach((v) => {
      if (!v?.ok) {
        if (v?.error) {
          overall = worstRisk(overall, "HIGH");
          high += 1;
        }
        return;
      }
      const data = v.data || {};
      const r = String(data.overall_risk || "").toUpperCase();
      overall = worstRisk(overall, r || "LOW");

      const details = Array.isArray(data.details) ? data.details : [];
      if (details.length === 0) {
        low += 1;
        return;
      }
      details.forEach((d) => {
        const s = String(d.severity || r || "").toUpperCase();
        if (s === "HIGH") high += 1;
        else if (s === "MEDIUM" || s === "MID") mid += 1;
        else low += 1;
      });
    });

    return { overall, high, mid, low };
  }, [comboResults]);

  const overallUI = useMemo(() => {
    const r = String(summary.overall || "").toUpperCase();
    if (r === "HIGH") return { pill: "주의", tone: "danger" };
    if (r === "MEDIUM" || r === "MID") return { pill: "주의", tone: "warn" };
    return { pill: "양호", tone: "ok" };
  }, [summary.overall]);

  const overallRiskText = useMemo(() => {
    const r = String(summary.overall || "").toUpperCase();
    if (r === "HIGH") return "HIGH";
    if (r === "MEDIUM" || r === "MID") return "MEDIUM";
    return "LOW";
  }, [summary.overall]);

  // ---------- handlers ----------
  const toggleProduct = (id) => {
    if (inspecting) return;
    const sid = String(id);
    setSelectedProductIds((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const selectAllVisible = () => {
    if (inspecting) return;
    setSelectedProductIds(filteredProducts.map((p) => String(p.id)));
  };

  const clearProducts = () => {
    if (inspecting) return;
    setSelectedProductIds([]);
  };

  const selectAllCountries = () => {
    if (inspecting) return;
    setSelectedCountries(COUNTRY_OPTIONS.map((c) => c.code));
  };

  const clearCountries = () => {
    if (inspecting) return;
    setSelectedCountries([]);
  };

  const runInspection = async () => {
    if (inspecting) return;

    if (selectedProductIds.length === 0) {
      alert("제품을 선택해주세요.");
      return;
    }
    if (selectedCountries.length === 0) {
      alert("국가를 선택해주세요.");
      return;
    }

    // 결과 초기화
    setHasRun(true);
    setComboResults({});
    setProgressPct(0);
    setProgressText("");
    setInspecting(true);

    const pList = selectedProductIds.map((id) => productById.get(String(id))).filter(Boolean);
    const cList = [...selectedCountries];

    const total = pList.length * cList.length;
    let done = 0;

    for (const p of pList) {
      const ingredients = normStr(p.ingredients || p.fullIngredient);
      for (const market of cList) {
        setProgressText(`${p.name} · ${market}`);
        try {
          if (!ingredients) throw new Error("전성분(ingredients)이 비어있습니다.");
          const data = await checkIngredients({ market, ingredients });
          setComboResults((prev) => ({
            ...prev,
            [`${p.id}__${market}`]: { ok: true, data },
          }));
        } catch (e) {
          setComboResults((prev) => ({
            ...prev,
            [`${p.id}__${market}`]: { ok: false, error: e?.message || "요청 실패" },
          }));
        } finally {
          done += 1;
          const pct = Math.round((done / total) * 100);
          setProgressPct(pct);
        }
      }
    }

    setInspecting(false);

    // 결과 패널로 자연스럽게 이동
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  // ---------- UI helpers ----------
  const selectedCount = selectedProductIds.length;

  const selectedProductLabel = useMemo(() => {
    if (selectedProducts.length === 0) return "";
    if (selectedProducts.length === 1) return selectedProducts[0]?.name || "";
    const first = selectedProducts[0]?.name || "제품";
    return `${first} 외 ${selectedProducts.length - 1}개`;
  }, [selectedProducts]);

  const selectedCountryLabel = useMemo(() => {
    if (selectedCountries.length === 0) return "";
    if (selectedCountries.length === 1) return countryNameOf(selectedCountries[0]);
    const first = countryNameOf(selectedCountries[0]);
    return `${first} 외 ${selectedCountries.length - 1}개`;
  }, [selectedCountries]);

  const hasAnyData = hasRun && doneTasks > 0;
  const showNoIssue = hasAnyData && tableRows.length === 0;

  return (
    <div className="cosy-page">
      {/* 상단 선택 요약 */}
      {selectedProductLabel ? (
        <div className="cosy-card" style={{ padding: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: "#6b7280" }}>선택 제품</div>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#111827", marginTop: 4 }}>
            {selectedProductLabel}
          </div>
        </div>
      ) : null}

      {/* 상단 3패널 */}
      <div className="cosy-grid-3">
        {/* 1) 제품 리스트 */}
        <div className="cosy-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div className="cosy-panel__title">제품 선택</div>
            <span className={`cosy-status-pill ${status.cls}`}>{status.text}</span>
          </div>

          <div className="cosy-card cosy-product-toolbar" style={{ padding: 14 }}>
            {/* 검색 */}
            <div
              className="cosy-card"
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="제품명 또는 전성분 검색"
                disabled={inspecting}
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  background: "transparent",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#111827",
                }}
              />
            </div>

            <div className="cosy-toolbar-divider" />

            {/* 선택/필터 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 900 }}>
                <input
                  type="checkbox"
                  className="cosy-native-check"
                  checked={showSelectedOnly}
                  onChange={(e) => setShowSelectedOnly(e.target.checked)}
                  disabled={inspecting}
                />
                <span style={{ fontSize: 13, color: "#111827" }}>선택된 제품만 보기</span>
              </label>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <span className="cosy-count-badge">선택 {selectedCount}개</span>
                <div className="cosy-mini-actions" style={{ marginTop: 0 }}>
                  <button
                    className="cosy-btn"
                    type="button"
                    onClick={selectAllVisible}
                    disabled={inspecting || filteredProducts.length === 0}
                  >
                    전체 선택
                  </button>
                  <button
                    className="cosy-btn"
                    type="button"
                    onClick={clearProducts}
                    disabled={inspecting || selectedCount === 0}
                  >
                    해제
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 리스트 */}
          <div
            className="cosy-product-list"
            style={{
              marginTop: 14,
              overflowY: "auto",
              maxHeight: 430,
              paddingRight: 6,
              opacity: inspecting ? 0.7 : 1,
            }}
          >
            {filteredProducts.length === 0 ? (
              <div className="cosy-center-box">
                <div className="cosy-circle">–</div>
                <div className="cosy-strong">표시할 제품이 없습니다</div>
                <div className="cosy-subtext">검색 조건을 변경해보세요.</div>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const active = selectedProductIds.includes(String(p.id));
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`cosy-product-item ${active ? "is-active" : ""}`}
                    onClick={() => toggleProduct(p.id)}
                    disabled={inspecting}
                    title={p.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      opacity: inspecting ? 0.85 : 1,
                    }}
                  >
                    {/* 체크 */}
                    <div className={`cosy-check ${active ? "is-checked" : ""}`}>
                      <Check size={14} />
                    </div>

                    {/* 텍스트 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="cosy-product-item__name"
                        style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      >
                        {p.name}
                      </div>
                      <div className="cosy-product-item__desc" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {(p.ingredients || "").length > 58
                          ? `${p.ingredients.slice(0, 58)}…`
                          : p.ingredients || "전성분 정보 없음"}
                      </div>
                    </div>

                    {/* 선택 상태 */}
                    <div style={{ flex: "0 0 auto" }}>
                      <span className={`cosy-selected-pill ${active ? "" : "is-off"}`}>
                        {active ? "선택" : "미선택"}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* 2) 검사 패널 */}
        <div className="cosy-panel">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div className="cosy-panel__title">검사</div>
            <span className={`cosy-status-pill ${status.cls}`}>{status.text}</span>
          </div>

          {/* ✅ 검사 중에는 국가 선택 UI 잠금 + 약간 투명 */}
          <div style={{ pointerEvents: inspecting ? "none" : "auto", opacity: inspecting ? 0.65 : 1 }}>
            <CountryMultiSelect
              label="대상 국가 선택"
              options={COUNTRY_OPTIONS}
              value={selectedCountries}
              onChange={setSelectedCountries}
              placeholder="국가를 선택하세요"
            />
          </div>

          <div className="cosy-mini-actions" style={{ opacity: inspecting ? 0.65 : 1 }}>
            <button type="button" className="cosy-btn" disabled={inspecting} onClick={selectAllCountries}>
              전체 선택
            </button>
            <button type="button" className="cosy-btn" disabled={inspecting} onClick={clearCountries}>
              해제
            </button>
          </div>

          <div className="cosy-card" style={{ padding: 14, marginTop: 8 }}>
            <div className="cosy-progress-row">
              <div className="cosy-progress-label">선택</div>
              <div className="cosy-progress-chips">
                <span className="cosy-progress-chip">{selectedProductIds.length}개 제품</span>
                <span className="cosy-progress-chip">{selectedCountries.length}개 국가</span>
                <span className={`cosy-progress-chip ${totalTasks ? "" : "is-muted"}`}>
                  {totalTasks ? `총 ${totalTasks}개 조합` : "조합 없음"}
                </span>
              </div>
            </div>

            <div className="cosy-toolbar-divider" style={{ margin: "12px 0" }} />

            <button
              type="button"
              className="cosy-btn cosy-btn--primary cosy-btn--full"
              onClick={runInspection}
              disabled={inspecting || selectedProductIds.length === 0 || selectedCountries.length === 0}
              title={
                inspecting
                  ? "검사 진행 중입니다"
                  : selectedProductIds.length === 0
                  ? "제품을 선택해주세요"
                  : selectedCountries.length === 0
                  ? "국가를 선택해주세요"
                  : ""
              }
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {inspecting ? <Loader2 size={16} className="cosy-spin" /> : null}
              {inspecting ? "검사 중..." : hasRun ? "다시 검사" : "검사 실행"}
            </button>
          </div>

          {/* 진행 상태 */}
          <div style={{ marginTop: 12 }}>
            <div className="cosy-card" style={{ padding: 14 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>진행률</div>
                <div style={{ fontWeight: 1000, fontSize: 18, color: "#111827" }}>{progressPct}%</div>
              </div>

              <div
                style={{
                  height: 8,
                  background: "#E5E7EB",
                  borderRadius: 999,
                  overflow: "hidden",
                  marginTop: 10,
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

              <div className="cosy-subtext" style={{ marginTop: 8, fontWeight: 900, textAlign: "center" }}>
                {inspecting
                  ? `처리 중: ${progressText || "…"}`
                  : hasRun && totalTasks
                  ? `완료: ${doneTasks}/${totalTasks} · 마지막: ${progressText || "—"}`
                  : "대기 중"}
              </div>
            </div>
          </div>
        </div>

        {/* 3) 진행/요약 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">진행 / 요약</div>

          {/* 진행 카드 (오른쪽 고정 느낌) */}
          <div className="cosy-card" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>현재 상태</div>
              <span className={`cosy-status-pill ${status.cls}`}>{status.text}</span>
            </div>

            <div className="cosy-toolbar-divider" style={{ margin: "12px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <div className="cosy-subtext" style={{ fontWeight: 1000 }}>
                {totalTasks ? `완료 ${doneTasks}/${totalTasks}` : "조합을 선택해주세요"}
              </div>
              <div style={{ fontWeight: 1000, fontSize: 22 }}>{progressPct}%</div>
            </div>

            <div
              style={{
                height: 8,
                background: "#E5E7EB",
                borderRadius: 999,
                overflow: "hidden",
                marginTop: 10,
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

            <div className="cosy-subtext" style={{ marginTop: 8, fontWeight: 900 }}>
              {inspecting ? `처리 중: ${progressText || "…"}` : progressText ? `마지막 처리: ${progressText}` : "—"}
            </div>
          </div>

          {/* 전체 위험도 */}
          <div
            className={`cosy-status-card ${overallUI.tone === "ok" ? "is-pass" : "is-fail"}`}
            style={{ marginTop: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div className="cosy-status-card__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {overallUI.tone === "ok" ? null : <AlertTriangle size={18} />}
                전체 위험도: {overallRiskText}
              </div>
              <span className="cosy-chip">{overallUI.pill}</span>
            </div>
            <div className="cosy-status-card__meta">
              {hasRun
                ? `선택 국가: ${selectedCountryLabel || "없음"} · 선택 제품: ${selectedProductLabel || "없음"}`
                : "제품/국가를 선택한 뒤 검사를 실행하세요."}
            </div>
          </div>

          {/* ✅ 통계: 신호등(빨/노/초) */}
          <div className="cosy-stats">
            <div
              className="cosy-stat"
              style={{
                background: SEVERITY_META.HIGH.bg,
                color: SEVERITY_META.HIGH.fg,
                border: `1px solid ${SEVERITY_META.HIGH.bd}`,
              }}
            >
              <div className="cosy-stat__label">HIGH</div>
              <div className="cosy-stat__value">{summary.high}</div>
            </div>

            <div
              className="cosy-stat"
              style={{
                background: SEVERITY_META.MEDIUM.bg,
                color: SEVERITY_META.MEDIUM.fg,
                border: `1px solid ${SEVERITY_META.MEDIUM.bd}`,
              }}
            >
              <div className="cosy-stat__label">MEDIUM</div>
              <div className="cosy-stat__value">{summary.mid}</div>
            </div>

            <div
              className="cosy-stat"
              style={{
                background: SEVERITY_META.LOW.bg,
                color: SEVERITY_META.LOW.fg,
                border: `1px solid ${SEVERITY_META.LOW.bd}`,
              }}
            >
              <div className="cosy-stat__label">LOW</div>
              <div className="cosy-stat__value">{summary.low}</div>
            </div>
          </div>

          {/* 선택 국가/제품 요약 */}
          <div className="cosy-card" style={{ padding: 14 }}>
            <div className="cosy-progress-row">
              <div className="cosy-progress-label">국가</div>
              <div className="cosy-progress-chips">
                {selectedCountries.length === 0 ? (
                  <span className="cosy-progress-chip is-muted">선택 필요</span>
                ) : (
                  selectedCountries.map((c) => (
                    <span key={c} className="cosy-progress-chip">
                      {countryNameOf(c)}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="cosy-toolbar-divider" style={{ margin: "12px 0" }} />

            <div className="cosy-progress-row">
              <div className="cosy-progress-label">제품</div>
              <div className="cosy-progress-chips">
                <span className="cosy-progress-chip">{selectedCount}개 선택</span>
                <span className={`cosy-progress-chip ${hasRun ? "" : "is-muted"}`}>
                  {hasRun ? (showNoIssue ? "이슈 없음" : `이슈 ${tableRows.length}건`) : "결과 대기"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 결과 패널 */}
      <div className="cosy-panel is-tall" ref={resultsRef} style={{ marginTop: 14 }}>
        <div className="cosy-panel__title">제품별 상세 규제 부적합 요소</div>

        {!hasRun ? (
          <div className="cosy-center-box">
            <div className="cosy-circle">–</div>
            <div className="cosy-strong">분석을 실행하면 상세 결과가 표시됩니다</div>
            <div className="cosy-subtext">선택한 제품/국가 조합별 부적합 요소를 표로 보여줍니다.</div>
          </div>
        ) : showNoIssue ? (
          <div className="cosy-center-box">
            <div className="cosy-circle">✓</div>
            <div className="cosy-strong">부적합 요소가 발견되지 않았습니다</div>
            <div className="cosy-subtext">선택한 조합에서 규제 이슈가 없거나 결과가 비어있습니다.</div>
          </div>
        ) : (
          <div className="cosy-card cosy-table-card">
            <div className="cosy-table-wrap">
              <table className="cosy-table">
                <thead>
                  <tr>
                    <th style={{ width: 160 }}>제품명</th>
                    <th style={{ width: 120 }}>국가명</th>
                    {/* ✅ 추가 컬럼 */}
                    <th style={{ width: 110, textAlign: "center" }}>위험도</th>
                    <th style={{ width: 190 }}>부적합한 성분명</th>
                    <th style={{ width: 200 }}>규제 위치</th>
                    <th>상세 규제 내용</th>
                    <th style={{ width: 160 }}>필요한 작업</th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((r) => (
                    <tr key={r.key}>
                      <td style={{ fontWeight: 900 }}>{r.productName}</td>
                      <td>{r.countryName}</td>
                      {/* ✅ pill 표시 */}
                      <td style={{ textAlign: "center" }}>
                        <SeverityPill value={r.severity} />
                      </td>
                      <td style={{ fontWeight: 900 }}>{r.ingredient || "-"}</td>
                      <td>{r.regulation || "-"}</td>
                      <td className="cosy-cell-wrap">{r.content || "-"}</td>
                      <td className="cosy-cell-wrap">{r.action || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
