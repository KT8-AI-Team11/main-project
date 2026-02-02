import React, { useEffect, useMemo, useState } from "react";
import { Clock, Minus } from "lucide-react";
import CountryMultiSelect from "../components/CountryMultiSelect";
import { useProducts } from "../store/ProductsContext";
import { checkIngredients } from "../api/compliance";

export default function IngredientCheckPage() {
  const { products, fetchProducts } = useProducts(); // ✅ Context에서 가져오기
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCountryCodes, setSelectedCountryCodes] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | loading | done
  const [analysisResults, setAnalysisResults] = useState(null);

  const isLoading = phase === "loading";

  useEffect(() => {
    if (!products || products.length === 0) {
      fetchProducts?.(); // Context에 fetchProducts를 넣어둔 경우
    }
  }, [products, fetchProducts]);

  const uiProducts = useMemo(() => {
    return (Array.isArray(products) ? products : [])
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        name: p.name ?? "(이름 없음)",
        ingredients: p.fullIngredient ?? "", // ✅ 여기 매핑!
        raw: p,
      }));
  }, [products]);

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

  const isReady = !!selectedProduct && selectedCountryCodes.length > 0;

  const resetResults = () => {
    if (phase === "done") {
      setPhase("idle");
      setAnalysisResults(null);
    }
  };

  const mapSeverity = (s) => {
    const v = String(s || "").toUpperCase();
    return v === "HIGH" ? "high" : "mid";
  };

  // ✅ 이제 진짜 API 호출로 결과 생성
  const handleSubmit = async () => {
    if (!selectedProduct) return alert("제품을 선택해주세요");
    if (selectedCountryCodes.length === 0) return alert("최소 1개 이상의 국가를 선택해주세요");

    const ingredientsText = String(selectedProduct.ingredients || "").trim();
    if (!ingredientsText) {
      return alert("선택한 제품의 전성분 정보가 비어있습니다.(fullIngredient 확인 필요)");
    }

    try {
      setPhase("loading");
      setAnalysisResults(null);

      const rows = [];

      // 안전하게 순차 호출(백엔드 부하/레이트 이슈 방지)
      for (const market of selectedCountryCodes) {
        const apiRes = await checkIngredients({
          market,
          ingredients: ingredientsText,
        });

        const details = Array.isArray(apiRes?.details) ? apiRes.details : [];

        for (const d of details) {
          rows.push({
            product: selectedProduct.name,
            country: codeToName(market),
            ingredient: d.ingredient,
            regulation: d.regulation,
            content: d.content,
            action: d.action,
            severity: mapSeverity(d.severity),
          });
        }
      }

      const totalIssues = rows.length;
      const highRisk = rows.filter((r) => r.severity === "high").length;
      const mediumRisk = totalIssues - highRisk;
      const status = totalIssues > 0 ? "부적합" : "적합";

      setAnalysisResults({
        summary: { totalIssues, highRisk, mediumRisk, status },
        details: rows,
      });

      setPhase("done");
    } catch (e) {
      console.error(e);
      alert(e?.message || "성분 규제 검사 중 오류가 발생했습니다.");
      setPhase("idle");
    }
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
            {uiProducts.map((product) => {
              const active = selectedProduct?.id === product.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={`cosy-product-item ${active ? "is-active" : ""}`}
                  onClick={() => {
                    if (isLoading) return;
                    setSelectedProduct(product);
                    resetResults();
                  }}
                  disabled={isLoading}
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
              if (isLoading) return;
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
                if (isLoading) return;
                setSelectedCountryCodes(countryOptions.map((c) => c.code));
                resetResults();
              }}
              disabled={isLoading}
            >
              전체 선택
            </button>

            <button
              type="button"
              className="cosy-btn"
              onClick={() => {
                if (isLoading) return;
                setSelectedCountryCodes([]);
                resetResults();
              }}
              disabled={isLoading}
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
                  <div className="cosy-status-card__title">{analysisResults.summary.status}</div>
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
                        선택한 제품/국가 기준으로 이슈가 발견되지 않았습니다.
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
