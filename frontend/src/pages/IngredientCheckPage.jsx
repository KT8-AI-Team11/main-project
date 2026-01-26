import React, { useState } from 'react';
import { Clock, Minus, ChevronRight } from 'lucide-react';

export default function IngredientCheckPage() {
  const [step, setStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [analysisResults, setAnalysisResults] = useState(null);

  const products = [
    { id: 1, name: '제품 A', ingredients: 'Water, Glycerin, Alcohol' },
    { id: 2, name: '제품 B', ingredients: 'Aqua, Propylene Glycol, Fragrance' },
    { id: 3, name: '제품 C', ingredients: 'Water, Niacinamide, Hyaluronic Acid' },
    { id: 4, name: '제품 D', ingredients: 'Aqua, Retinol, Vitamin E' },
    { id: 5, name: '제품 E', ingredients: 'Water, Collagen, Peptides' }
  ];

  const countries = [
    { id: 1, name: '미국', code: 'US' },
    { id: 2, name: '유럽연합', code: 'EU' },
    { id: 3, name: '중국', code: 'CN' },
    { id: 4, name: '일본', code: 'JP' }
  ];

  const mockAnalysisData = {
    summary: {
      totalIssues: 3,
      highRisk: 1,
      mediumRisk: 2,
      status: '부적합'
    },
    details: [
      {
        product: '제품 A',
        country: '유럽연합',
        ingredient: 'Alcohol (Denat.)',
        regulation: 'EU Annex III',
        content: '변성 알코올 최대 허용 농도 초과',
        action: '농도 조정 필요'
      },
      {
        product: '제품 B',
        country: '미국',
        ingredient: 'Fragrance',
        regulation: 'FDA GRAS',
        content: '알레르기 유발 성분 표기 미비',
        action: '라벨 표기 추가'
      },
      {
        product: '제품 D',
        country: '중국',
        ingredient: 'Retinol',
        regulation: 'NMPA 2021',
        content: '특수화장품 신고 필요 성분',
        action: '신고 절차 진행'
      }
    ]
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleCountryToggle = (country) => {
    if (selectedCountries.find(c => c.id === country.id)) {
      setSelectedCountries(selectedCountries.filter(c => c.id !== country.id));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleAddCountry = () => {
    setStep(2);
  };

  const handleSubmit = () => {
    if (!selectedProduct) {
      alert('제품을 선택해주세요');
      return;
    }
    if (selectedCountries.length === 0) {
      alert('최소 1개 이상의 국가를 선택해주세요');
      return;
    }

    setStep(3);
    setAnalysisResults(null);

    // 분석 시뮬레이션 (2초 후 결과 표시)
    setTimeout(() => {
      setAnalysisResults(mockAnalysisData);
      setStep(4);
    }, 2000);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedProduct(null);
    setSelectedCountries([]);
    setAnalysisResults(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', backgroundColor: '#f3f4f6', padding: '32px' }}>
      {/* Three Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        {/* Product List */}
        <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>제품 리스트</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: selectedProduct?.id === product.id ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>{product.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{product.ingredients.substring(0, 30)}...</div>
              </div>
            ))}
          </div>
        </div>

        {/* Country Selection */}
        <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px', position: 'relative' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>국가</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {step === 1 && (
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={handleAddCountry}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '3px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '24px', fontWeight: '300', lineHeight: '1' }}>+</span>
                </button>
              </div>
            )}

            {step >= 2 && countries.map((country) => (
              <div
                key={country.id}
                onClick={() => handleCountryToggle(country)}
                style={{
                  backgroundColor: 'white',
                  padding: '16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  border: selectedCountries.find(c => c.id === country.id) ? '2px solid #3b82f6' : '2px solid transparent',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: '600', color: '#1f2937' }}>{country.name}</span>
                {selectedCountries.find(c => c.id === country.id) && (
                  <span style={{ color: '#3b82f6', fontSize: '18px' }}>✓</span>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={step === 3}
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              padding: '8px 24px',
              backgroundColor: step === 3 ? '#9ca3af' : 'white',
              color: '#1f2937',
              borderRadius: '4px',
              border: '1px solid #9ca3af',
              cursor: step === 3 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {step === 3 ? '분석 중...' : '심사'}
          </button>
        </div>

        {/* Summary */}
        <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>규제 통과 여부 요약</h3>
          <div style={{ backgroundColor: 'white', borderRadius: '4px', minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            {step === 1 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Minus style={{ width: '32px', height: '32px', color: '#1f2937' }} />
                </div>
                <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>제품과 국가를 선택하세요</p>
              </div>
            )}
            {step === 2 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Minus style={{ width: '32px', height: '32px', color: '#1f2937' }} />
                </div>
                <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>
                  {selectedProduct ? `${selectedProduct.name} 선택됨` : '제품을 선택하세요'}
                </p>
                <p style={{ marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                  {selectedCountries.length}개 국가 선택됨
                </p>
              </div>
            )}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <Clock style={{ width: '64px', height: '64px', color: '#9ca3af', animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>분석 중...</p>
              </div>
            )}
            {step === 4 && analysisResults && (
              <div style={{ width: '100%' }}>
                <div style={{ backgroundColor: analysisResults.summary.status === '부적합' ? '#fee2e2' : '#d1fae5', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: `2px solid ${analysisResults.summary.status === '부적합' ? '#ef4444' : '#10b981'}` }}>
                  <div style={{ fontWeight: 'bold', color: analysisResults.summary.status === '부적합' ? '#dc2626' : '#059669', fontSize: '18px', marginBottom: '8px' }}>
                    {analysisResults.summary.status}
                  </div>
                  <div style={{ fontSize: '14px', color: '#4b5563' }}>
                    총 {analysisResults.summary.totalIssues}건의 이슈 발견
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ flex: 1, backgroundColor: '#fef3c7', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '4px' }}>고위험</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e' }}>{analysisResults.summary.highRisk}</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#fed7aa', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#9a3412', marginBottom: '4px' }}>중위험</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9a3412' }}>{analysisResults.summary.mediumRisk}</div>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  새로운 분석 시작
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Table Section */}
      <div style={{ backgroundColor: '#d1d5db', padding: '24px', borderRadius: '8px' }}>
        <h3 style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '16px', margin: '0 0 16px 0' }}>제품별 상세 규제 부적합 요소</h3>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', backgroundColor: '#f3f4f6', borderBottom: '1px solid #d1d5db' }}>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>제품명</div>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>국가명</div>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>부적합한 성분명</div>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>규제 위치</div>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>상세 규제 내용</div>
            <div style={{ padding: '16px', fontWeight: '600', color: '#4b5563', fontSize: '14px' }}>필요한 작업</div>
          </div>
          <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            {(step === 1 || step === 2) && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Minus style={{ width: '32px', height: '32px', color: '#1f2937' }} />
                </div>
                <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>분석을 실행하면 상세 결과가 표시됩니다</p>
              </div>
            )}
            {step === 3 && (
              <div style={{ textAlign: 'center' }}>
                <Clock style={{ width: '64px', height: '64px', color: '#9ca3af' }} />
                <p style={{ marginTop: '16px', color: '#6b7280', fontSize: '14px' }}>상세 분석 중...</p>
              </div>
            )}
            {step === 4 && analysisResults && (
              <div style={{ width: '100%' }}>
                {analysisResults.details.map((detail, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', borderBottom: index < analysisResults.details.length - 1 ? '1px solid #e5e7eb' : 'none', padding: '16px 0' }}>
                    <div style={{ padding: '0 16px', fontSize: '14px', color: '#1f2937', fontWeight: '600' }}>{detail.product}</div>
                    <div style={{ padding: '0 16px', fontSize: '14px', color: '#4b5563' }}>{detail.country}</div>
                    <div style={{ padding: '0 16px', fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>{detail.ingredient}</div>
                    <div style={{ padding: '0 16px', fontSize: '14px', color: '#4b5563' }}>{detail.regulation}</div>
                    <div style={{ padding: '0 16px', fontSize: '14px', color: '#4b5563' }}>{detail.content}</div>
                    <div style={{ padding: '0 16px', fontSize: '14px' }}>
                      <button style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>
                        {detail.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

//성분 규제 확인 페이지