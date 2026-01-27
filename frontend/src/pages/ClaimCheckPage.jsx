import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Minus } from "lucide-react";
import CountryMultiSelect from "../components/CountryMultiSelect";

export default function ClaimCheckPage() {
  // 데모용 제품/문구 데이터 (나중에 백엔드/DB로 교체)
  const [products] = useState([
    {
      id: 1,
      name: "제품 A",
      claim:
        "이 제품은 여드름 치료에 도움을 주며 항염 효과가 있습니다. 즉시 효과를 느낄 수 있고 100% 만족을 보장합니다.",
      location: "상세페이지",
    },
    {
      id: 2,
      name: "제품 B",
      claim: "미백 및 주름 개선에 도움을 줄 수 있습니다. 부작용 없음.",
      location: "패키지 라벨",
    },
    {
      id: 3,
      name: "제품 C",
      claim: "피부 진정에 도움을 줄 수 있으며 촉촉함을 제공합니다.",
      location: "상세페이지",
    },
    {
      id: 4,
      name: "제품 D",
      claim: "살균 효과로 트러블을 치료합니다.",
      location: "광고 배너",
    },
    {
      id: 5,
      name: "제품 E",
      claim: "항균/항염 케어로 피부 고민을 해결합니다.",
      location: "상세페이지",
    },
  ]);

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

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]); // code[]
  const [summary, setSummary] = useState(null); // { status: 'pass'|'warn'|'fail', text }
  const [rows, setRows] = useState([]); // table rows

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const reset = () => {
    setSummary(null);
    setRows([]);
  };

  const onCountriesChange = (next) => {
    setSelectedCountries(next);
    reset();
  };

  const onSelectProduct = (id) => {
    setSelectedProductId(id);
    reset();
  };

  const runAudit = () => {
    if (!selectedProductId) return alert("제품을 선택해주세요.");
    if (selectedCountries.length === 0) return alert("국가를 선택해주세요.");

    const claim = selectedProduct.claim;
    const hits = [];
    rules.forEach((r) => {
      if (claim.includes(r.k)) hits.push(r);
    });

    // 데모 판정
    const score = hits.reduce((acc, h) => acc + (h.severity === "high" ? 3 : 1), 0);
    const status = score >= 6 ? "fail" : score >= 2 ? "warn" : "pass";
    const statusText =
      status === "pass" ? "통과(데모)" : status === "warn" ? "주의(데모)" : "부적합(데모)";

    setSummary({ status, text: statusText });

    // 테이블 rows 생성 (국가별 동일 hits를 펼치는 데모)
    const out = [];
    selectedCountries.forEach((c) => {
      const countryName = allCountries.find((x) => x.code === c)?.name || c;
      hits.forEach((h) => {
        out.push({
          productName: selectedProduct.name,
          countryName,
          badClaim: h.k,
          location: selectedProduct.location,
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
    ) : summary.status === "warn" ? (
      <div className="cosy-circle" style={{ borderColor: "#FCD34D" }}>
        <AlertTriangle size={18} color="#D97706" />
      </div>
    ) : (
      <div className="cosy-circle" style={{ borderColor: "#FCA5A5" }}>
        <AlertTriangle size={18} color="#DC2626" />
      </div>
    );

  return (
    <div className="cosy-page">
      {/* 상단 3패널 */}
      <div className="cosy-grid-3">
        {/* 제품 리스트 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">제품 리스트</div>

          <div className="cosy-product-list">
            {products.map((p) => {
              const active = p.id === selectedProductId;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cosy-product-item ${active ? "is-active" : ""}`}
                  onClick={() => onSelectProduct(p.id)}
                >
                  <div className="cosy-product-item__name">{p.name}</div>
                  <div className="cosy-product-item__desc">
                    {p.claim.length > 44 ? p.claim.slice(0, 44) + "..." : p.claim}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 국가 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">국가</div>

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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "auto", paddingTop: 18 }}>
            <button type="button" className="cosy-btn" onClick={runAudit}>
              심사
            </button>
          </div>
        </div>

        {/* 요약 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">규제 통과 여부 요약</div>

          <div className="cosy-card cosy-center-box" style={{ minHeight: 220 }}>
            {summaryIcon}

            {!summary ? (
              <div className="cosy-subtext">제품과 국가를 선택하세요</div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>{summary.text}</div>
                <div className="cosy-subtext">* 데모 판정입니다. 실제 규정/근거 기반 확인 필요</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 하단 테이블 */}
      <div className="cosy-panel is-tall" style={{ minHeight: 360 }}>
        <div className="cosy-panel__title">제품별 상세 규제 부적합 요소</div>

        <div className="cosy-card">
          <div className="cosy-table-wrap">
            <table className="cosy-table">
              <thead>
                <tr>
                  <th>제품명</th>
                  <th>국가명</th>
                  <th>부적합한 문구</th>
                  <th>문구 위치</th>
                  <th>상세 규제 내용</th>
                  <th>필요한 작업</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 14px" }}>
                      <div className="cosy-center-box" style={{ minHeight: 140 }}>
                        <div className="cosy-circle">
                          <Minus size={18} />
                        </div>
                        <div className="cosy-subtext">분석을 실행하면 상세 결과가 표시됩니다</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="cosy-strong">{r.productName}</td>
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
  );
}
