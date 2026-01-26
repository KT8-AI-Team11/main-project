import React, { useState } from "react";
import { Bell, Home } from "lucide-react";
import MainPage from "./pages/MainPage";
import ProductsPage from "./pages/ProductsPage";
import IngredientCheckPage from "./pages/IngredientCheckPage";
import ClaimCheckPage from "./pages/ClaimCheckPage";
import LoginPage from "./pages/LoginPage";


const SidebarItem = ({ label, active, onClick }) => (
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
    }}
  >
    {label}
  </div>
);

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
    }}
  >
    {label}
  </button>
);

export default function CosyUI() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", backgroundColor: "#f9fafb", fontFamily: "sans-serif", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: "224px", backgroundColor: "#e5e7eb", padding: "24px", borderRight: "1px solid #d1d5db", overflowY: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <SidebarItem active={currentPage === "home"} onClick={() => setCurrentPage("home")} label="AI 성분 분석기" />
          <SidebarItem label="제품 검색/분석" />
          <SidebarItem active={currentPage === "products"} onClick={() => setCurrentPage("products")} label="내 제품 관리" />
          <SidebarItem label="프로필 설정" />
          <SidebarItem label="알림 설정" />
          <SidebarItem label="국가별 규제 정보" />
          <SidebarItem active={currentPage === "ingredient-check"} onClick={() => setCurrentPage("ingredient-check")} label="성분 규제 확인"/>
<SidebarItem active={currentPage === "claim-check"} onClick={() => setCurrentPage("claim-check")} label="문구 규제 확인"/>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => setCurrentPage("home")}>
            <Home style={{ width: "24px", height: "24px", color: "#374151" }} />
            <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>COSY</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <HeaderButton label="로그인" onClick={() => setCurrentPage("login")} />
            <HeaderButton label="공지사항" onClick={() => {}} />
            <HeaderButton label="최근 검색" onClick={() => {}} />
            <Bell style={{ width: "24px", height: "24px", color: "#374151", cursor: "pointer" }} />
          </div>
        </div>

        {/* Page switch */}
        {currentPage === "home" && <MainPage />}
        {currentPage === "products" && <ProductsPage />}
        {currentPage === "ingredient-check" && <IngredientCheckPage />}
        {currentPage === "claim-check" && <ClaimCheckPage />}
        {currentPage === "login" && <LoginPage onBack={() => setCurrentPage("home")} />}
      </div>
    </div>
  );
}
