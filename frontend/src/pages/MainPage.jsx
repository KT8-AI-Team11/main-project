import React, { useState } from "react";
import { Search, X, CheckCircle, Image, Code, Send } from "lucide-react";

const Notice = ({ onClose }) => (
  <div style={{ padding: "24px 32px", flexShrink: 0 }}>
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "white",
        border: "1px solid #3b82f6",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1d4ed8" }}>
          <CheckCircle size={18} />
          <h3 style={{ fontSize: "14px", fontWeight: "bold", margin: 0 }}>이용 약관 및 규제 업데이트 안내</h3>
        </div>
        <X size={16} color="#6b7280" cursor="pointer" onClick={onClose} />
      </div>
      <p style={{ fontSize: "13px", color: "#4b5563", marginLeft: "26px", marginBottom: "12px" }}>
        유럽(EU) 및 북미(MoCRA) 화장품 규정 변경에 따른 성분 분석 알고리즘이 업데이트되었습니다.
      </p>
    </div>
  </div>
);

const InputIconButton = ({ icon }) => (
  <button
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

export default function MainPage() {
  const [showNotice, setShowNotice] = useState(true);

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
        <div style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: "40px", fontWeight: "bold", marginBottom: "16px", color: "#111827" }}>COSY</h2>
          <p style={{ fontSize: "18px", color: "#4b5563", marginBottom: "32px" }}>
            성분표 한 장으로 글로벌 규제 위반 여부를 즉시 확인하세요.
          </p>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="성분명 또는 제품명을 검색해 보세요"
              style={{
                width: "100%",
                padding: "16px 56px 16px 24px",
                border: "2px solid #3b82f6",
                borderRadius: "9999px",
                fontSize: "16px",
                outline: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Search style={{ position: "absolute", right: "-60px", top: "50%", transform: "translateY(-50%)", color: "#3b82f6" }} />
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "white", padding: "20px 32px", flexShrink: 0 }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
          <input
            type="text"
            placeholder="분석하고 싶은 성분 파일을 업로드하거나 질문을 입력하세요."
            style={{
              width: "100%",
              padding: "10px 0px 10px 10px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <div style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "8px" }}>
            <InputIconButton icon={<Image size={20} />} />
            <InputIconButton icon={<Code size={20} />} />
            <InputIconButton icon={<Send size={20} color="#3b82f6" />} />
          </div>
        </div>
      </div>
    </div>
  );
}
