import React from "react";
import { Lock, User } from "lucide-react";

const SidebarItem = ({ label, active, onClick, locked, hint }) => (
  <div
    onClick={onClick}
    style={{
      fontSize: "14px",
      color: active ? "#111827" : "#4b5563",
      padding: "10px 12px",
      cursor: "pointer",
      borderRadius: "8px",
      backgroundColor: active ? "#d1d5db" : "transparent",
      fontWeight: active ? "600" : "400",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
      opacity: locked ? 0.95 : 1,
    }}
    title={locked && hint ? hint : ""}
  >
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {label}
      {locked && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6b7280" }}>
          <Lock size={14} />
        </span>
      )}
    </span>
    {locked && hint && (
      <span style={{ fontSize: 11, color: "#9ca3af", whiteSpace: "nowrap" }}>{hint}</span>
    )}
  </div>
);

export default function Sidebar({ currentPage, onNavigate, isLoggedIn, userEmail }) {
  const lockHint = "로그인 필요";

  return (
    <div
      style={{
        width: "224px",
        backgroundColor: "#e5e7eb",
        padding: "20px",
        borderRight: "1px solid #d1d5db",
        overflowY: "auto",
      }}
    >
      {/* ✅ 게스트/유저 표시 영역 */}
      <div
        style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "14px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #e5e7eb",
            }}
          >
            <User size={18} color="#6b7280" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#111827",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {isLoggedIn ? (userEmail || "로그인됨") : "게스트"}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {isLoggedIn ? "서비스 이용 중" : "로그인 후 전체 기능 이용"}
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <SidebarItem
          active={currentPage === "home"}
          onClick={() => onNavigate("home")}
          label="AI 성분 분석기"
        />

        <SidebarItem
          active={currentPage === "products"}
          onClick={() => onNavigate("products")}
          label="내 제품 관리"
          locked={!isLoggedIn}
          hint={!isLoggedIn ? lockHint : ""}
        />

        <SidebarItem
          active={currentPage === "ingredient-check"}
          onClick={() => onNavigate("ingredient-check")}
          label="성분 규제 확인"
          locked={!isLoggedIn}
          hint={!isLoggedIn ? lockHint : ""}
        />

        <SidebarItem
          active={currentPage === "claim-check"}
          onClick={() => onNavigate("claim-check")}
          label="문구 규제 확인"
          locked={!isLoggedIn}
          hint={!isLoggedIn ? lockHint : ""}
        />

        {/* ✅ 프로필 페이지 연결 */}
        <SidebarItem
          active={currentPage === "profile"}
          onClick={() => onNavigate("profile")}
          label="프로필 설정"
          locked={!isLoggedIn}
          hint={!isLoggedIn ? lockHint : ""}
        />

        <SidebarItem label="알림 설정" onClick={() => onNavigate("home")} />
        <SidebarItem label="국가별 규제 정보" onClick={() => onNavigate("home")} />
      </div>
    </div>
  );
}
