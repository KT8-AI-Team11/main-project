import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Check, Loader2, AlertTriangle } from "lucide-react";
import CountryMultiSelect from "../components/CountryMultiSelect";
import { checkIngredients } from "../api/compliance";
import { useProducts } from "../store/ProductsContext";
import { saveInspectionLog } from "../api/log";

const COUNTRY_OPTIONS = [
    { code: "US", name: "미국" },
    { code: "EU", name: "유럽연합" },
    { code: "CN", name: "중국" },
    { code: "JP", name: "일본" },
];

const countryNameOf = (code) =>
    COUNTRY_OPTIONS.find((c) => c.code === code)?.name || code;

const normStr = (v) => (v == null ? "" : String(v)).trim();

// ✅ 검색 보강: 공백 무시 + (선택) 초성 검색
const stripWSLower = (v) => String(v || "").toLowerCase().replace(/\s+/g, "");

// 한글 초성(19개)
const CHOSEONG = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
];

const toChoseong = (v) => {
    const s = String(v || "");
    let out = "";
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);
        // 가(0xAC00) ~ 힣(0xD7A3)
        if (code >= 0xac00 && code <= 0xd7a3) {
            const idx = Math.floor((code - 0xac00) / 588);
            out += CHOSEONG[idx] || "";
        } else {
            out += s[i];
        }
    }
    return out;
};

const isChoseongQuery = (q) => /^[ㄱ-ㅎ]+$/.test(String(q || ""));

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

    // 제품 리스트: 4개까지만 보이도록 높이 계산(이후 스크롤)
    const firstProductItemRef = useRef(null);

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


    const [productItemHeight, setProductItemHeight] = useState(0);

    const [selectedCountries, setSelectedCountries] = useState([]);
    const [inspecting, setInspecting] = useState(false);

    // progress
    const [progressPct, setProgressPct] = useState(0);
    const [progressText, setProgressText] = useState("");


    // progress/summary panel UI
    const [showSummaryDetails, setShowSummaryDetails] = useState(false);
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

        // ✅ 아무 것도 선택되지 않은 상태를 허용 (자동으로 첫 제품 선택하지 않음)
        //    - ProductsPage에서 넘어온 경우: initialSelectedProductIds/localStorage로 복원됨
        //    - 사이드바로 직접 진입한 경우: 선택 0개 상태로 시작
    }, [initialSelectedProductIds, mergedProducts]);

    // ---------- derived lists ----------
    const filteredProducts = useMemo(() => {
        const q = stripWSLower(query);
        const base = mergedProducts.filter((p) => {
            if (!q) return true;

            const name = stripWSLower(p.name);
            const ing = stripWSLower(p.ingredients);

            // 1) 기본: 공백 제거 후 포함 검색
            if (name.includes(q) || ing.includes(q)) return true;

            // 2) 초성 검색: 예) "ㄱㅁㅅ" → "가면수" 형태의 제품명 매칭
            if (isChoseongQuery(q)) {
                const nameCho = toChoseong(name);
                if (nameCho.includes(q)) return true;
            }

            return false;
        });
        if (!showSelectedOnly) return base;
        const set = new Set(selectedProductIds);
        return base.filter((p) => set.has(String(p.id)));
    }, [mergedProducts, query, showSelectedOnly, selectedProductIds]);


    // ✅ 제품 리스트 영역: 실제 아이템 1개의 높이를 측정해서 "4개까지만" 보이도록 maxHeight 설정
    useEffect(() => {
        const el = firstProductItemRef.current;
        if (!el) return;

        const update = () => {
            const node = firstProductItemRef.current;
            if (!node) return;
            const rect = node.getBoundingClientRect();
            const cs = window.getComputedStyle(node);
            const mt = parseFloat(cs.marginTop) || 0;
            const mb = parseFloat(cs.marginBottom) || 0;
            const h = rect.height + mt + mb;
            setProductItemHeight((prev) => (h && Math.abs(h - prev) > 1 ? h : prev));
        };

        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, [filteredProducts.length]);

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


    // ✅ 진행/요약 패널은 기본적으로 "간단 보기" (검사 시작 시 자동으로 상세 닫기)
    useEffect(() => {
        if (inspecting) setShowSummaryDetails(false);
    }, [inspecting]);
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

                    // Data 보내기
                    const details = Array.isArray(data.details) ? data.details : [];
                    
                    // 위험도 결정
                    const hasHigh = details.some(d =>
                        ["HIGH", "FORBIDDEN", "CRITICAL"].includes(String(d.severity || "").toUpperCase())
                    );
                    const hasMedium = details.some(d =>
                        ["MEDIUM", "RESTRICTED", "MID", "WARNING"].includes(String(d.severity || "").toUpperCase())
                    );
                    const finalStatus = hasHigh ? "HIGH" : (hasMedium ? "MEDIUM" : "LOW");

                    const logRequest = {
                        productId: Number(p.id),
                        country: market || "US",
                        approvalStatus: finalStatus,
                        // 성분명이 있을 때만 합치기
                        cautiousIngredient: details.map(d => d.ingredient).join(", ").slice(0, 255) || "없음",
                        ingredientLaw: details.map(d => `${d.ingredient}: ${d.regulation}`).join("\n").slice(0, 500) || "제한 규제 없음",
                        marketingLaw: ""
                    };

                    await saveInspectionLog(logRequest);
                    
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

            {/* 상단 3패널 */}
            <div className="cosy-grid-3">
                {/* 1) 제품 리스트 */}
                <div className="cosy-panel">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div className="cosy-panel__title">제품 리스트</div>
                        <span className="cosy-count-badge">선택 {selectedCount}개</span>
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

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
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
                            maxHeight: productItemHeight ? Math.round(productItemHeight * 4) : 320,
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
                            filteredProducts.map((p, idx) => {
                                const active = selectedProductIds.includes(String(p.id));
                                return (
                                    <button
                                        key={p.id}
                                        ref={idx === 0 ? firstProductItemRef : null}
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

                    {/* ✅ 실행 버튼(진행률/진행바는 오른쪽 '진행/요약' 패널로만 노출) */}
                    <div className="cosy-card" style={{ padding: 14, marginTop: 10, display: "flex", flexDirection: "column", gap: 12 }}>
                        <div className="cosy-subtext" style={{ fontWeight: 900 }}>
                            선택: {selectedProductIds.length}개 제품 · {selectedCountries.length}개 국가 ·{" "}
                            {totalTasks ? `총 ${totalTasks}개 조합` : "조합 없음"}
                        </div>

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
                </div>

                {/* 3) 진행/요약 */}
                <div className="cosy-panel">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                        <div className="cosy-panel__title">진행 / 요약</div>
                        <span className={`cosy-status-pill ${status.cls}`}>{status.text}</span>
                    </div>

                    {/* ✅ 핵심 카드: 상태별로 꼭 필요한 정보만 */}
                    <div className="cosy-card" style={{ padding: 14, marginTop: 10 }}>
                        {!hasRun && !inspecting ? (
                            <>
                                <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>검사 준비</div>
                                <div className="cosy-subtext" style={{ marginTop: 8, fontWeight: 900 }}>
                                    선택: {selectedCount}개 제품 · {selectedCountries.length}개 국가
                                </div>
                                <div className="cosy-subtext" style={{ marginTop: 6 }}>
                                    제품/국가를 선택한 뒤 <b>검사 실행</b>을 눌러주세요.
                                </div>
                            </>
                        ) : inspecting ? (
                            <>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                                    <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>진행률</div>
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

                                <div className="cosy-subtext" style={{ marginTop: 10, fontWeight: 900 }}>
                                    {totalTasks ? `${doneTasks}/${totalTasks} 완료` : "조합을 선택해주세요"}
                                </div>

                                <div className="cosy-subtext" style={{ marginTop: 6 }}>
                                    현재 처리: {progressText || "…"}
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                    <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>전체 위험도</div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontWeight: 1000 }}>{overallRiskText}</span>
                                        <span className="cosy-chip">{overallUI.pill}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginTop: 12 }}>
                                    <div style={{ fontWeight: 1000, fontSize: 13, color: "#111827" }}>총 이슈</div>
                                    <div style={{ fontWeight: 1000, fontSize: 22 }}>{tableRows.length}건</div>
                                </div>

                                <div className="cosy-subtext" style={{ marginTop: 8, fontWeight: 900 }}>
                                    HIGH {summary.high} · MEDIUM {summary.mid} · LOW {summary.low}
                                </div>

                                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                                    <button type="button" className="cosy-btn" onClick={() => setShowSummaryDetails((v) => !v)}>
                                        {showSummaryDetails ? "상세 닫기" : "상세 보기"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ✅ 상세(필요할 때만): 통계/부가정보는 숨겼다가 펼치기 */}
                    {hasRun && !inspecting && showSummaryDetails ? (
                        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                            {/* 통계: 신호등(빨/노/초) */}
                            <div className="cosy-stats" style={{ marginTop: 0 }}>
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
                        </div>
                    ) : null}
                </div>
            </div>

            {/* 하단 결과 패널 */}
            <div className="cosy-panel is-tall" ref={resultsRef} style={{ marginTop: 14 }}>
                <div className="cosy-panel__title">성분 규제 검사 결과</div>

                {!hasRun ? (
                    <div className="cosy-center-box">
                        <div className="cosy-circle">–</div>
                        <div className="cosy-strong">검사를 실행하면 상세 결과가 표시됩니다</div>
                        <div className="cosy-subtext">선택한 제품/국가 조합별 검사 결과를 표로 보여줍니다.</div>
                    </div>
                ) : showNoIssue ? (
                    <div className="cosy-center-box">
                        <div className="cosy-circle">✓</div>
                        <div className="cosy-strong">규제 이슈가 발견되지 않았습니다</div>
                        <div className="cosy-subtext">선택한 조합에서 결과가 비어있거나, 규제상 문제로 판단된 항목이 없습니다.</div>
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
                                    <th style={{ width: 190 }}>성분명</th>
                                    <th style={{ width: 200 }}>관련 규정</th>
                                    <th>상세 내용</th>
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