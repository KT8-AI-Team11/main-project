import React, { useState } from "react";
import {
  Search,
  X,
  CheckCircle,
  Image as ImageIcon,
  Code,
  Send,
} from "lucide-react";

export default function MainPage({ isLoggedIn, onGoLogin, onGoProducts, onDemoLogin }) {
  const [showNotice, setShowNotice] = useState(true);
  const [searchText, setSearchText] = useState("");

  // ✅ (홈 3번) 로그인 후 요약(임시) - 추후 백엔드/전역상태로 교체
  const safeJson = (v, fallback) => {
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  };

  const userEmail = localStorage.getItem("cosy_user_email") || "";
  const productsLS = safeJson(localStorage.getItem("cosy_products"), []);
  const productCount = Array.isArray(productsLS) ? productsLS.length : 0;
  const recentChecks = Number(localStorage.getItem("cosy_recent_checks") || 0);
  const warningCount = Number(localStorage.getItem("cosy_warning_count") || 0);

  // ✅ (홈 4번) 로그인 전/후 행동 차이
  const requireLogin = (actionName) => {
    if (isLoggedIn) {
      alert(`${actionName} 기능은 데모 단계입니다. (추후 API 연동)`);
      return;
    }
    alert(`${actionName} 기능은 로그인 후 이용할 수 있어요.`);
    onGoLogin?.();
  };

  const handleSearch = () => {
    if (!searchText.trim()) return alert("검색어를 입력해주세요.");
    if (!isLoggedIn) {
      alert("검색은 가능하지만, 저장/검토 기능은 로그인 후 이용할 수 있어요.");
      onGoLogin?.();
      return;
    }
    alert(`"${searchText}" 검색 (데모 단계: 추후 API 연동)`);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {showNotice && <Notice onClose={() => setShowNotice(false)} />}

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: "720px", width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "10px", color: "#111827" }}>
            COSY
          </h2>
          <p style={{ fontSize: "16px", color: "#4b5563", marginBottom: "20px" }}>
            성분표 한 장으로 글로벌 규제 위반 여부를 즉시 확인하세요.
          </p>

          {/* ✅ 홈 1번: CTA 버튼 (로그인 전/후) */}
          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "18px", flexWrap: "wrap" }}>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onGoProducts}
                style={{
                  height: "44px",
                  padding: "0 16px",
                  borderRadius: "12px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  backgroundColor: "#111827",
                  color: "white",
                }}
              >
                내 제품 관리로 이동
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onGoLogin}
                  style={{
                    height: "44px",
                    padding: "0 16px",
                    borderRadius: "12px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 800,
                    backgroundColor: "#3b82f6",
                    color: "white",
                  }}
                >
                  로그인하고 제품관리 시작하기
                </button>

                <button
                  type="button"
                  onClick={onDemoLogin}
                  style={{
                    height: "44px",
                    padding: "0 16px",
                    borderRadius: "12px",
                    border: "1px solid #dbeafe",
                    cursor: "pointer",
                    fontWeight: 800,
                    backgroundColor: "white",
                    color: "#1d4ed8",
                  }}
                >
                  임의 로그인(코치)
                </button>
              </>
            )}
          </div>

          {/* ✅ 홈 3번: 요약 영역 (로그인 전/후) */}
          {isLoggedIn ? (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827", marginBottom: "10px" }}>
                {userEmail ? `${userEmail}님, 환영합니다.` : "환영합니다."}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
                <div style={summaryCardStyle}>
                  <div style={summaryLabelStyle}>등록 제품</div>
                  <div style={summaryValueStyle}>{productCount}</div>
                  <div style={summaryHintStyle}>내 제품 관리에서 추가</div>
                </div>

                <div style={summaryCardStyle}>
                  <div style={summaryLabelStyle}>최근 규제 검토</div>
                  <div style={summaryValueStyle}>{recentChecks}</div>
                  <div style={summaryHintStyle}>추후 자동 집계</div>
                </div>

                <div style={summaryCardStyle}>
                  <div style={summaryLabelStyle}>경고 항목</div>
                  <div style={summaryValueStyle}>{warningCount}</div>
                  <div style={summaryHintStyle}>추후 자동 집계</div>
                </div>
              </div>

              <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af" }}>
                * 현재는 데모 단계라 수치가 임시 값(0)일 수 있어요.
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "22px" }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827", marginBottom: "10px" }}>
                COSY로 할 수 있는 것
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
                <div style={featureCardStyle}>
                  <div style={featureTitleStyle}>성분 규제 확인</div>
                  <div style={featureDescStyle}>금지/제한 성분을 빠르게 점검</div>
                </div>
                <div style={featureCardStyle}>
                  <div style={featureTitleStyle}>문구 규제 확인</div>
                  <div style={featureDescStyle}>광고·표현 리스크를 사전 탐지</div>
                </div>
                <div style={featureCardStyle}>
                  <div style={featureTitleStyle}>제품 관리/리포트</div>
                  <div style={featureDescStyle}>제품별 이력/검토 결과를 관리</div>
                </div>
              </div>
            </div>
          )}

          {/* 검색창 */}
          <div style={{ position: "relative", maxWidth: "650px", margin: "0 auto" }}>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="성분명 또는 제품명을 검색해 보세요"
              style={{
                width: "100%",
                padding: "16px 56px 16px 24px",
                border: "2px solid #3b82f6",
                borderRadius: "9999px",
                fontSize: "16px",
                outline: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                boxSizing: "border-box",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="검색"
            >
              <Search color="#3b82f6" />
            </button>
          </div>
        </div>
      </div>

      {/* 하단 입력바 */}
      <div style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "white", padding: "20px 32px", flexShrink: 0 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="분석하고 싶은 성분 파일을 업로드하거나 질문을 입력하세요."
            style={{
              width: "100%",
              padding: "10px 120px 10px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px" }}>
            <InputIconButton icon={<ImageIcon size={20} />} onClick={() => requireLogin("파일 업로드")} />
            <InputIconButton icon={<Code size={20} />} onClick={() => requireLogin("성분표 분석")} />
            <InputIconButton icon={<Send size={20} color="#3b82f6" />} onClick={() => requireLogin("전송")} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----- 컴포넌트/스타일 ----- */

const Notice = ({ onClose }) => (
  <div style={{ padding: "24px 32px", flexShrink: 0 }}>
    <div style={{ maxWidth: "800px", margin: "0 auto", backgroundColor: "white", border: "1px solid #3b82f6", borderRadius: "12px", padding: "16px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1d4ed8" }}>
          <CheckCircle size={18} />
          <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>이용 약관 및 규제 업데이트 안내</h3>
        </div>
        <X size={16} color="#6b7280" cursor="pointer" onClick={onClose} />
      </div>
      <p style={{ fontSize: "13px", color: "#4b5563", marginLeft: "26px", marginBottom: 0 }}>
        유럽(EU) 및 북미(MoCRA) 화장품 규정 변경에 따른 성분 분석 알고리즘이 업데이트되었습니다.
      </p>
    </div>
  </div>
);

const InputIconButton = ({ icon, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "8px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      borderRadius: "6px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {icon}
  </button>
);

const summaryCardStyle = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
};

const summaryLabelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#6b7280",
  marginBottom: "8px",
};

const summaryValueStyle = {
  fontSize: "22px",
  fontWeight: 900,
  color: "#111827",
  lineHeight: 1.1,
};

const summaryHintStyle = {
  marginTop: "8px",
  fontSize: "12px",
  color: "#9ca3af",
};

const featureCardStyle = {
  backgroundColor: "white",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "14px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
};

const featureTitleStyle = {
  fontSize: "14px",
  fontWeight: 900,
  color: "#111827",
  marginBottom: "6px",
};

const featureDescStyle = {
  fontSize: "12px",
  color: "#6b7280",
  lineHeight: 1.4,
};
