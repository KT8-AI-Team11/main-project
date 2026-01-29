import React from "react";
import { Lock } from "lucide-react";

const SidebarItem = ({ label, active, onClick, requiresLogin, isLoggedIn }) => {
    const handleClick = () => {
        if (requiresLogin && !isLoggedIn) {
            alert("해당 기능은 로그인 후 이용할 수 있어요.");
            return;
        }
        if (onClick) {
            onClick();
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                fontSize: "14px",
                color: active ? "#111827" : "#4b5563",
                padding: "10px 12px",
                cursor: "pointer",
                borderRadius: "8px",
                backgroundColor: active ? "#d1d5db" : "transparent",
                fontWeight: active ? "600" : "400",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}
        >
            <span>{label}</span>
            {requiresLogin && !isLoggedIn && (
                <Lock style={{ width: "14px", height: "14px", color: "#9ca3af" }} />
            )}
        </div>
    );
};

export default function Sidebar({ currentPage, onNavigate, isLoggedIn }) {
    return (
        <div style={{
            width: "224px",
            backgroundColor: "#e5e7eb",
            padding: "24px",
            borderRight: "1px solid #d1d5db",
            overflowY: "auto"
        }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* 메인 메뉴 */}
                <SidebarItem
                    active={currentPage === "home"}
                    onClick={() => onNavigate("home")}
                    label="AI 성분 분석기"
                    isLoggedIn={isLoggedIn}
                />

                {/* 제품 관련 */}
                <SidebarItem
                    active={currentPage === "products"}
                    onClick={() => onNavigate("products")}
                    label="내 제품 관리"
                    requiresLogin={true}
                    isLoggedIn={isLoggedIn}
                />

                {/* 규제 확인 */}
                <SidebarItem
                    active={currentPage === "ingredient-check"}
                    onClick={() => onNavigate("ingredient-check")}
                    label="성분 규제 확인"
                    requiresLogin={true}
                    isLoggedIn={isLoggedIn}
                />

                <SidebarItem
                    active={currentPage === "claim-check"}
                    onClick={() => onNavigate("claim-check")}
                    label="문구 규제 확인"
                    requiresLogin={true}
                    isLoggedIn={isLoggedIn}
                />

                {/* 설정 */}
                <SidebarItem
                    active={currentPage === "profile"}
                    onClick={() => onNavigate("profile")}
                    label="프로필 설정"
                    requiresLogin={true}
                    isLoggedIn={isLoggedIn}
                />

                <SidebarItem
                    label="알림 설정"
                    requiresLogin={true}
                    isLoggedIn={isLoggedIn}
                />

                <SidebarItem
                    label="국가별 규제 정보"
                    isLoggedIn={isLoggedIn}
                />
            </div>
        </div>
    );
}