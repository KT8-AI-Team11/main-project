import React, { useMemo, useState } from "react";
import { Clock, Minus } from "lucide-react";
import CountryMultiSelect from "../components/CountryMultiSelect";

export default function IngredientCheckPage() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCountryCodes, setSelectedCountryCodes] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | loading | done
  const [analysisResults, setAnalysisResults] = useState(null);

  const products = [
    { id: 1, name: "제품 A", ingredients: "Water, Glycerin, Alcohol" },
    { id: 2, name: "제품 B", ingredients: "Aqua, Propylene Glycol, Fragrance" },
    { id: 3, name: "제품 C", ingredients: "Water, Niacinamide, Hyaluronic Acid" },
    { id: 4, name: "제품 D", ingredients: "Aqua, Retinol, Vitamin E" },
    { id: 5, name: "제품 E", ingredients: "Water, Collagen, Peptides" },
  ];

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

  const codeToName = useMemo(() => {
    const m = new Map(countryOptions.map((c) => [c.code, c.name]));
    return (code) => m.get(code) || code;
  }, [countryOptions]);

  // 데모용 규제 이슈 (나중에 백엔드/RAG/DB로 교체)
  const mockDetails = useMemo(
    () => [
      {
        product: "제품 A",
        country: "유럽연합",
        ingredient: "Alcohol (Denat.)",
        regulation: "EU Annex III",
        content: "변성 알코올 최대 허용 농도 초과",
        action: "농도 조정 필요",
        severity: "mid",
      },
      {
        product: "제품 B",
        country: "미국",
        ingredient: "Fragrance",
        regulation: "FDA GRAS",
        content: "알레르기 유발 성분 표기 미비",
        action: "라벨 표기 추가",
        severity: "mid",
      },
      {
        product: "제품 D",
        country: "중국",
        ingredient: "Retinol",
        regulation: "NMPA 2021",
        content: "특수화장품 신고 필요 성분",
        action: "신고 절차 진행",
        severity: "high",
      },
    ],
    []
  );

  const isReady = !!selectedProduct && selectedCountryCodes.length > 0;

  const buildResult = () => {
    const selectedCountryNames = selectedCountryCodes.map(codeToName);

    const details = mockDetails.filter((d) => {
      const okProduct = selectedProduct ? d.product === selectedProduct.name : true;
      const okCountry = selectedCountryNames.includes(d.country);
      return okProduct && okCountry;
    });

    const totalIssues = details.length;
    const highRisk = details.filter((d) => d.severity === "high").length;
    const mediumRisk = details.filter((d) => d.severity === "mid").length;

    const status = totalIssues > 0 ? "부적합" : "적합";

    return {
      summary: { totalIssues, highRisk, mediumRisk, status },
      details,
    };
  };

  const resetResults = () => {
    if (phase === "done") {
      setPhase("idle");
      setAnalysisResults(null);
    }
  };

  const handleSubmit = () => {
    if (!selectedProduct) return alert("제품을 선택해주세요");
    if (selectedCountryCodes.length === 0) return alert("최소 1개 이상의 국가를 선택해주세요");

    setPhase("loading");
    setAnalysisResults(null);

    setTimeout(() => {
      setAnalysisResults(buildResult());
      setPhase("done");
    }, 900);
  };

  const handleResetAll = () => {
    setSelectedProduct(null);
    setSelectedCountryCodes([]);
    setAnalysisResults(null);
    setPhase("idle");
  };

  const statusClass =
    analysisResults?.summary?.status === "부적합"
      ? "cosy-status-card is-fail"
      : "cosy-status-card is-pass";

  return (
    <div className="cosy-page">
      {/* 상단 3패널 */}
      <div className="cosy-grid-3">
        {/* 제품 리스트 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">제품 리스트</div>

          <div className="cosy-product-list">
            {products.map((product) => {
              const active = selectedProduct?.id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`cosy-product-item ${active ? "is-active" : ""}`}
                  onClick={() => {
                    setSelectedProduct(product);
                    resetResults();
                  }}
                >
                  <div className="cosy-product-item__name">{product.name}</div>
                  <div className="cosy-product-item__desc">
                    {product.ingredients.substring(0, 36)}...
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 국가 */}
        <div className="cosy-panel is-relative">
          <div className="cosy-panel__title">국가</div>

          <CountryMultiSelect
            label="대상 국가 선택"
            options={countryOptions}
            value={selectedCountryCodes}
            onChange={(next) => {
              setSelectedCountryCodes(next);
              resetResults();
            }}
            placeholder="국가를 선택하세요"
          />

          <div className="cosy-mini-actions">
            <button
              type="button"
              className="cosy-btn"
              onClick={() => {
                setSelectedCountryCodes(countryOptions.map((c) => c.code));
                resetResults();
              }}
            >
              전체 선택
            </button>

            <button
              type="button"
              className="cosy-btn"
              onClick={() => {
                setSelectedCountryCodes([]);
                resetResults();
              }}
            >
              해제
            </button>
          </div>

          <button
            type="button"
            className="cosy-btn cosy-submit"
            onClick={handleSubmit}
            disabled={phase === "loading"}
          >
            {phase === "loading" ? "분석 중..." : "심사"}
          </button>
        </div>

        {/* 요약 */}
        <div className="cosy-panel">
          <div className="cosy-panel__title">규제 통과 여부 요약</div>

          <div className="cosy-card cosy-center-box" style={{ minHeight: 320 }}>
            {phase !== "done" && phase !== "loading" && (
              <>
                <div className="cosy-circle">
                  <Minus size={18} />
                </div>

                <div className="cosy-subtext">
                  {!selectedProduct || selectedCountryCodes.length === 0
                    ? "제품과 국가를 선택하세요"
                    : "심사를 실행해보세요"}
                </div>

                {isReady && (
                  <div className="cosy-subtext" style={{ fontWeight: 700 }}>
                    {selectedProduct?.name} · {selectedCountryCodes.length}개 국가 선택됨
                  </div>
                )}
              </>
            )}

            {phase === "loading" && (
              <>
                <Clock className="cosy-spin" size={40} color="#9ca3af" />
                <div className="cosy-subtext">분석 중...</div>
              </>
            )}

            {phase === "done" && analysisResults && (
              <div style={{ width: "100%" }}>
                <div className={statusClass}>
                  <div className="cosy-status-card__title">
                    {analysisResults.summary.status}
                  </div>
                  <div className="cosy-status-card__meta">
                    총 {analysisResults.summary.totalIssues}건의 이슈 발견
                  </div>
                </div>

                <div className="cosy-stats">
                  <div className="cosy-stat is-high">
                    <div className="cosy-stat__label">고위험</div>
                    <div className="cosy-stat__value">{analysisResults.summary.highRisk}</div>
                  </div>

                  <div className="cosy-stat is-mid">
                    <div className="cosy-stat__label">중위험</div>
                    <div className="cosy-stat__value">{analysisResults.summary.mediumRisk}</div>
                  </div>
                </div>

                <button
                  type="button"
                  className="cosy-btn cosy-btn--primary cosy-btn--full"
                  onClick={handleResetAll}
                >
                  새로운 분석 시작
                </button>
              </div>
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
                  <th>부적합한 성분명</th>
                  <th>규제 위치</th>
                  <th>상세 규제 내용</th>
                  <th>필요한 작업</th>
                </tr>
              </thead>

              <tbody>
                {phase !== "done" ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "40px 14px" }}>
                      <div className="cosy-center-box" style={{ minHeight: 140 }}>
                        {phase === "loading" ? (
                          <>
                            <Clock size={28} color="#9ca3af" />
                            <div className="cosy-subtext">상세 분석 중...</div>
                          </>
                        ) : (
                          <>
                            <div className="cosy-circle">
                              <Minus size={18} />
                            </div>
                            <div className="cosy-subtext">분석을 실행하면 상세 결과가 표시됩니다</div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : analysisResults?.details?.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: "26px 14px" }}>
                      <div className="cosy-subtext" style={{ fontWeight: 800 }}>
                        선택한 제품/국가 기준으로 이슈가 발견되지 않았습니다. (데모)
                      </div>
                    </td>
                  </tr>
                ) : (
                  analysisResults.details.map((d, idx) => (
                    <tr key={idx}>
                      <td className="cosy-strong">{d.product}</td>
                      <td>{d.country}</td>
                      <td>
                        <span className={`cosy-chip ${d.severity === "high" ? "is-high" : "is-mid"}`}>
                          {d.ingredient}
                        </span>
                      </td>
                      <td>{d.regulation}</td>
                      <td>{d.content}</td>
                      <td>{d.action}</td>
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
