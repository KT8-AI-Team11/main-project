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
import { login, logout, isTokenExpired } from "./api/auth";

export default function CosyUI() {
  /**
   * 현재 페이지 상태 초기화
   * - sessionStorage의 "redirect_to_login" 플래그 체크
   * - 세션 만료로 인한 reload 후 자동으로 로그인 페이지로 이동
   * - sessionStorage는 탭 종료 시 자동 삭제되어 일회성 플래그로 적합
   */
  const [currentPage, setCurrentPage] = useState(() => {
    const redirectToLogin = sessionStorage.getItem("redirect_to_login");
    if (redirectToLogin) {
      sessionStorage.removeItem("redirect_to_login");  // 플래그 제거 (일회성)
      return "login";
    }
    return "home";
  });
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
  const handleCoachDemoLogin = async () => {
    const DEMO_EMAIL = "aivle@test.com";
    const DEMO_PASSWORD = "*Aivle0611!";

    try {
      const response = await login(DEMO_EMAIL, DEMO_PASSWORD);
      localStorage.setItem("cosy_access_token", response.accessToken);
      localStorage.setItem("cosy_logged_in", "true");
      localStorage.setItem("cosy_login_type", "demo-oneclick");
      localStorage.setItem("cosy_user_email", response.email);

      setIsLoggedIn(true);
      setCurrentPage("home");
    } catch (error) {
      console.error("데모 로그인 실패:", error);
      alert("데모 로그인에 실패했습니다.");
    }
  };

  /**
   * 페이지 접근 권한 검사 (Route Guard)
   * - 보호된 페이지 접근 시 토큰 유효성을 미리 검사
   * - API 호출 전에 만료된 토큰을 감지하여 불필요한 요청 방지
   *
   * 동작 흐름:
   * 1. 보호된 페이지인지 확인
   * 2. localStorage에서 access token 가져옴
   * 3. 토큰이 없거나 만료됐으면:
   *    - 로그인 상태였으면 → "세션 만료" 알림
   *    - 비로그인 상태였으면 → "로그인 필요" 알림
   *    - 로그인 페이지로 이동
   * 4. 토큰이 유효하면 → 페이지 이동
   */
  const requireAuth = (targetPage) => {
    const protectedPages = ["products", "ingredient-check", "claim-check", "profile"];

    if (protectedPages.includes(targetPage)) {
      const token = localStorage.getItem("cosy_access_token");

      // 토큰이 없거나 만료된 경우 (isTokenExpired: JWT의 exp 클레임 체크)
      if (!token || isTokenExpired(token)) {
        // 로그인 상태였다면 세션 만료 처리
        if (isLoggedIn) {
          localStorage.removeItem("cosy_access_token");
          localStorage.removeItem("cosy_logged_in");
          localStorage.removeItem("cosy_user_email");
          setIsLoggedIn(false);
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          alert("해당 기능은 로그인 후 이용할 수 있어요.");
        }
        setCurrentPage("login");
        return;
      }
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
