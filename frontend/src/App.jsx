import React, { useMemo, useState } from "react";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWidget from "./components/Chatwidget";

import MainPage from "./pages/MainPage";
import ProductsPage from "./pages/ProductsPage";
import IngredientCheckPage from "./pages/IngredientCheckPage";
import ClaimCheckPage from "./pages/ClaimCheckPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { logout } from "./api/auth";

export default function CosyUI() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ✅ localStorage 기반 로그인 상태
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("cosy_logged_in") === "true"
  );

  const userEmail = useMemo(
    () => localStorage.getItem("cosy_user_email") || "",
    [isLoggedIn]
  );
  const loginType = useMemo(
    () => localStorage.getItem("cosy_login_type") || "",
    [isLoggedIn]
  );

  // ✅ 로그인 성공(일반/데모) 처리
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentPage("home");
  };

  // ✅ 로그아웃
  const handleLogout = async () => {
    const token = localStorage.getItem("cosy_access_token");

    try {
      if (token) {
        await logout(token);
      }
    } catch (error) {
      console.error("로그아웃 API 호출 실패:", error);
    } finally {
      localStorage.removeItem("cosy_access_token");
      localStorage.removeItem("cosy_logged_in");
      localStorage.removeItem("cosy_login_type");
      localStorage.removeItem("cosy_user_email");
      localStorage.removeItem("cosy_demo_user");

      setIsLoggedIn(false);
      setCurrentPage("home");
      setIsChatOpen(false);
    }
  };

  // ✅ 코치 임의 로그인(홈 버튼용)
  const handleCoachDemoLogin = () => {
    localStorage.setItem("cosy_logged_in", "true");
    localStorage.setItem("cosy_login_type", "demo-oneclick");
    localStorage.setItem("cosy_user_email", "coach-demo");

    setIsLoggedIn(true); // ✅ 화면 즉시 로그인 상태로 전환
    setCurrentPage("home");
  };

  // ✅ 로그인 필요 페이지 가드
  const requireAuth = (targetPage) => {
    // ✅ profile 추가
    const protectedPages = ["products", "ingredient-check", "claim-check", "profile"];

    if (!isLoggedIn && protectedPages.includes(targetPage)) {
      alert("해당 기능은 로그인 후 이용할 수 있어요.");
      setCurrentPage("login");
      return;
    }

    setCurrentPage(targetPage);
  };

  // ✅ 로그인 페이지는 레이아웃 숨김
  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setCurrentPage("register")}
      />
    );
  }

  // ✅ 회원가입 페이지
  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegisterSuccess={() => setCurrentPage("login")}
        onBackToLogin={() => setCurrentPage("login")}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        backgroundColor: "#f9fafb",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={requireAuth}
        isLoggedIn={isLoggedIn}
        userEmail={userEmail}
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <Header
          onGoHome={() => setCurrentPage("home")}
          onGoLogin={() => setCurrentPage("login")}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          loginType={loginType}
          onLogout={handleLogout}
        />

        {/* Pages */}
        {currentPage === "home" && (
          <MainPage
            isLoggedIn={isLoggedIn}
            onGoLogin={() => setCurrentPage("login")}
            onGoProducts={() => requireAuth("products")}
            onDemoLogin={handleCoachDemoLogin}
          />
        )}

        {currentPage === "products" && <ProductsPage />}
        {currentPage === "ingredient-check" && <IngredientCheckPage />}
        {currentPage === "claim-check" && <ClaimCheckPage />}

        {/* ✅ profile 페이지 분기 추가 */}
        {currentPage === "profile" && <ProfilePage />}
      </div>

      {/* Chat */}
      <ChatWidget isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
    </div>
  );
}
