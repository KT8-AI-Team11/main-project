import React from "react";
import {
  Home,
  Package,
  FlaskConical,
  Megaphone,
  User,
  Globe,
  ShieldCheck,
  Lock,
} from "lucide-react";

const NavItem = ({ label, icon: Icon, active, onClick, requiresLogin, isLoggedIn }) => {
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
      className={`cosy-nav-item ${locked ? "is-locked" : ""}`}
      data-active={active ? "true" : "false"}
      aria-current={active ? "page" : undefined}
    >
      <span className="cosy-nav-item__left">
        <Icon className="cosy-nav-item__icon" />
        <span className="cosy-nav-item__label">{label}</span>
      </span>

      <span className="cosy-nav-item__meta">
        {locked ? <Lock className="cosy-nav-item__lock" /> : null}
      </span>
    </button>
  );
};

export default function Sidebar({ currentPage, onNavigate, isLoggedIn }) {
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
    <aside className="cosy-sidebar">
      {/* Brand / Title */}
      <div className="cosy-sidebar__brand">
        <div className="cosy-sidebar__brand-title">COSY</div>
        <div className="cosy-sidebar__brand-sub">Navigation</div>
      </div>

      <div className="cosy-sidebar__scroll">
        

        {/* 섹션 2 */}
        <div className="cosy-sidebar__section">
          <div className="cosy-sidebar__section-title">서비스</div>
          <div className="cosy-nav">
            <NavItem
              label="AI 성분 분석기"
              icon={Home}
              active={currentPage === "home"}
              onClick={() => onNavigate("home")}
              isLoggedIn={isLoggedIn}
            />
            <NavItem
              label="내 제품 관리"
              icon={Package}
              active={currentPage === "products"}
              onClick={() => onNavigate("products")}
              requiresLogin
              isLoggedIn={isLoggedIn}
            />
            
          </div>
        </div>

        {/* 섹션 3 */}
        <div className="cosy-sidebar__section">
          <div className="cosy-sidebar__section-title">규제 확인</div>
          <div className="cosy-nav">
            <NavItem
              label="성분 규제 확인"
              icon={FlaskConical}
              active={currentPage === "ingredient-check"}
              onClick={() => {
                // ✅ 사이드바로 들어올 땐 이전 제품 선택 흔적 제거 (기존 로직 유지)
                localStorage.removeItem("cosy_selected_product_ids");
                localStorage.removeItem("cosy_selected_products");
                onNavigate("ingredient-check", { selectedProducts: [], selectedProductIds: [] });
              }}
              requiresLogin
              isLoggedIn={isLoggedIn}
            />
            <NavItem
              label="문구 규제 확인"
              icon={Megaphone}
              active={currentPage === "claim-check"}
              onClick={() => onNavigate("claim-check")}
              requiresLogin
              isLoggedIn={isLoggedIn}
            />
            <NavItem
              label="국가별 규제 정보"
              icon={Globe}
              active={currentPage === "country-regulations"}
              onClick={() => onNavigate("country-regulations")}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

       
      </div>

      {/* Footer */}
      <div className="cosy-sidebar__footer">
        <button type="button" className="cosy-footer-link" onClick={openPrivacy}>
          <ShieldCheck className="cosy-footer-link__icon" />
          개인정보 처리 방침
        </button>
      </div>
    </aside>
  );
}
