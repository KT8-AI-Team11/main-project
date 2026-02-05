import React from "react";
import { Bell, Home, LogOut, User } from "lucide-react";

const HeaderButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: "8px 12px",
      fontSize: "14px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
      color: "#4b5563",
      fontWeight: 700,
    }}
  >
    {label}
  </button>
);

export default function Header({
  onGoHome,
  onGoLogin,
  onGoProfile,
  isLoggedIn,
  userEmail,
  loginType,
  onLogout,
}) {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }}
        onClick={onGoHome}
      >
        <Home style={{ width: 24, height: 24, color: "#374151" }} />
        <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#111827", margin: 0 }}>
          COSY
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isLoggedIn ? (
          <>
            {/* ✅ 여기: 프로필 배너 클릭 시 마이페이지로 */}
            <div
              onClick={onGoProfile}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onGoProfile?.();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                color: "#111827",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                userSelect: "none",
              }}
              title="마이페이지 열기"
            >
              <User size={16} color="#6b7280" />
              <span
                style={{
                  maxWidth: 180,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {userEmail || "로그인됨"}
              </span>

              {loginType?.startsWith("demo") && (
                <span
                  style={{
                    marginLeft: 6,
                    padding: "2px 6px",
                    borderRadius: 999,
                    backgroundColor: "#dbeafe",
                    color: "#1d4ed8",
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  DEMO
                </span>
              )}
            </div>

            <button
              onClick={onLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer",
                fontWeight: 900,
                color: "#111827",
              }}
            >
              <LogOut size={16} color="#111827" />
              로그아웃
            </button>
          </>
        ) : (
          <HeaderButton label="로그인" onClick={onGoLogin} />
        )}

        <Bell style={{ width: 24, height: 24, color: "#374151", cursor: "pointer" }} />
      </div>
    </div>
  );
}
