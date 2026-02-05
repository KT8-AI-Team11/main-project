import React from "react";
import {
  Lock,
  Home,
  Package,
  FlaskConical,
  Megaphone,
  Globe,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const SidebarItem = ({
  label,
  icon: Icon,
  active,
  onClick,
  requiresLogin,
  isLoggedIn,
  collapsed,
}) => {
  const locked = Boolean(requiresLogin && !isLoggedIn);

  const handleClick = () => {
    if (locked) {
      alert("해당 기능은 로그인 후 이용할 수 있어요.");
      return;
    }
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}                 // ✅ 접힌 상태에서도 무엇인지 알 수 있게
      aria-label={label}
      aria-current={active ? "page" : undefined}
      style={{
        width: "100%",
        fontSize: "14px",
        color: active ? "#111827" : "#4b5563",
        padding: collapsed ? "10px 10px" : "10px 12px",
        cursor: locked ? "not-allowed" : "pointer",
        borderRadius: "10px",
        backgroundColor: active ? "#ffffff" : "transparent",
        fontWeight: active ? 800 : 500,
        display: "flex",
        justifyContent: collapsed ? "center" : "space-between",
        alignItems: "center",
        border: active ? "1px solid #d1d5db" : "1px solid transparent",
        opacity: locked ? 0.7 : 1,
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: collapsed ? 0 : 10 }}>
        <Icon style={{ width: "18px", height: "18px", color: active ? "#111827" : "#6b7280" }} />
        {!collapsed && <span>{label}</span>}
      </span>

      {!collapsed && locked && (
        <Lock style={{ width: "14px", height: "14px", color: "#9ca3af" }} />
      )}
    </button>
  );
};

export default function Sidebar({
  currentPage,
  onNavigate,
  isLoggedIn,
  collapsed = false,
  onToggleCollapsed,
}) {
  const openPrivacy = () => {
    const width = 600;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
      "/privacy-policy.html",
      "_blank",
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  return (
    <div
      style={{
        width: collapsed ? "72px" : "224px",
        backgroundColor: "#e5e7eb",
        padding: collapsed ? "14px 10px" : "24px",
        borderRight: "1px solid #d1d5db",
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 180ms ease, padding 180ms ease",
      }}
    >
      {/* 상단: 타이틀 + 접기 버튼 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {!collapsed && (
          <div style={{ fontWeight: 1000, color: "#111827", fontSize: 14 }}>
            COSY
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapsed}
          title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
          style={{
            border: "1px solid #e5e7eb",
            background: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            width: 36,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* 메뉴(스크롤) */}
      {/* 메뉴(스크롤) */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    paddingRight: 2,
  }}
>
  {/* 섹션 1: 서비스 */}
  {!collapsed && (
    <div
      style={{
        fontSize: 11,
        fontWeight: 900,
        color: "#6b7280",
        padding: "0 6px",
        marginTop: 6,
        marginBottom: 2,
      }}
    >
      서비스
    </div>
  )}

  <SidebarItem
    active={currentPage === "home"}
    onClick={() => onNavigate("home")}
    label="AI 성분 분석기"
    icon={Home}
    isLoggedIn={isLoggedIn}
    collapsed={collapsed}
  />

  <SidebarItem
    active={currentPage === "products"}
    onClick={() => onNavigate("products")}
    label="내 제품 관리"
    icon={Package}
    requiresLogin={true}
    isLoggedIn={isLoggedIn}
    collapsed={collapsed}
  />

  {/* 섹션 2: 규제 확인 */}
  {!collapsed && (
    <div
      style={{
        fontSize: 11,
        fontWeight: 900,
        color: "#6b7280",
        padding: "0 6px",
        marginTop: 10,
        marginBottom: 2,
      }}
    >
      규제 확인
    </div>
  )}

  <SidebarItem
    active={currentPage === "ingredient-check"}
    onClick={() => {
      localStorage.removeItem("cosy_selected_product_ids");
      localStorage.removeItem("cosy_selected_products");
      onNavigate("ingredient-check", { selectedProducts: [], selectedProductIds: [] });
    }}
    label="성분 규제 확인"
    icon={FlaskConical}
    requiresLogin={true}
    isLoggedIn={isLoggedIn}
    collapsed={collapsed}
  />

  <SidebarItem
    active={currentPage === "claim-check"}
    onClick={() => onNavigate("claim-check")}
    label="문구 규제 확인"
    icon={Megaphone}
    requiresLogin={true}
    isLoggedIn={isLoggedIn}
    collapsed={collapsed}
  />

  <SidebarItem
    active={currentPage === "country-regulations"}
    onClick={() => onNavigate("country-regulations")}
    label="국가별 규제 정보"
    icon={Globe}
    isLoggedIn={isLoggedIn}
    collapsed={collapsed}
  />
</div>

      {/* 하단: 개인정보 처리 방침 */}
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #d1d5db" }}>
        <button
          type="button"
          onClick={openPrivacy}
          title="개인정보 처리 방침"
          aria-label="개인정보 처리 방침"
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            padding: collapsed ? "10px 8px" : "10px 12px",
            borderRadius: 10,
            cursor: "pointer",
            color: "#6b7280",
            fontWeight: 800,
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
          }}
        >
          <ShieldCheck style={{ width: 16, height: 16 }} />
          {!collapsed && <span>개인정보 처리 방침</span>}
        </button>
      </div>
    </div>
  );
}
