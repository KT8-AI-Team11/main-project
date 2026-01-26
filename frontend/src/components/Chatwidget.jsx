import React from "react";
import { MessageCircle, X, Send } from "lucide-react";

export default function ChatWidget({ isChatOpen, setIsChatOpen }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
        zIndex: 1000,
      }}
    >
      {isChatOpen && (
        <div
          style={{
            width: "300px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#3b82f6",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <span style={{ color: "white", fontWeight: "bold" }}>COSY AI 어시스턴트</span>
            <X size={18} color="white" cursor="pointer" onClick={() => setIsChatOpen(false)} />
          </div>

          <div style={{ flex: 1, padding: "16px", overflowY: "auto", fontSize: "14px" }}>
            <div style={{ backgroundColor: "#f3f4f6", padding: "10px", borderRadius: "12px", marginBottom: "8px" }}>
              안녕하세요! 어떤 성분이 궁금하신가요?
            </div>
          </div>

          <div style={{ padding: "12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: "8px" }}>
            <input type="text" placeholder="메시지 입력..." style={{ flex: 1, border: "none", outline: "none", fontSize: "14px" }} />
            <Send size={18} color="#3b82f6" cursor="pointer" />
          </div>
        </div>
      )}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          width: "56px",
          height: "56px",
          backgroundColor: "#3b82f6",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MessageCircle color="white" size={24} />
      </button>
    </div>
  );
}
