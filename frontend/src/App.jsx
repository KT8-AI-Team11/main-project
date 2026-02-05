import React, { useMemo, useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ChatWidget from "./components/Chatwidget";
import Footer from "./components/Footer";

import MainPage from "./pages/MainPage";
import ProductsPage from "./pages/ProductsPage";
import IngredientCheckPage from "./pages/IngredientCheckPage";
import ClaimCheckPage from "./pages/ClaimCheckPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import { login, logout, isTokenExpired } from "./api/auth";
import CountryRegulationsPage from "./pages/CountryRegulationsPage";
import { useProducts } from "./store/ProductsContext";

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
      sessionStorage.removeItem("redirect_to_login");
      return "login";
    }
    return "home";
  });

  const [isChatOpen, setIsChatOpen] = useState(false);

  // ✅ Sidebar 접기/펼치기 상태 (localStorage에 저장)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("cosy_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });
 const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("cosy_sidebar_collapsed", next ? "1" : "0");
      } catch {}
      return next;
    });
  };

  // ✅ 페이지 이동 시 전달할 파라미터(선택 제품 등)
  const [pageParams, setPageParams] = useState({});
  const [pendingNav, setPendingNav] = useState(null);

  // localStorage 기반 로그인 상태
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

  const { products, setProducts } = useProducts();

  const api = axios.create({
      baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  });

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("cosy_access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      console.log("products response.data =", response.data);
      setProducts(response.data);
    } catch (error) {
      console.error("데이터 로딩 실패", error);
    }
  };

  const handleLoginSuccess = async() => {
    setIsLoggedIn(true);

    // 로그인 가드에 막혀서 login으로 왔던 경우, 원래 가려던 페이지로 복귀
    if (pendingNav?.targetPage) {
      setPageParams(pendingNav.params || {});
      setCurrentPage(pendingNav.targetPage);
      setPendingNav(null);
      return;
    }

    await fetchProducts();
    setCurrentPage("home");
  };
  // 로그아웃 (서버 API 호출 포함)
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
      // 선택 제품 전달용 임시값
      localStorage.removeItem("cosy_selected_product_ids");
      localStorage.removeItem("cosy_selected_products");

      setIsLoggedIn(false);
      setCurrentPage("home");
      setIsChatOpen(false);
      setPageParams({});
      setPendingNav(null);
    }
  };

  // 코치 임의 로그인(홈 버튼용) - 실제 API 호출
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
   * @param {string} targetPage - 이동할 페이지
   * @param {object} params - 페이지에 전달할 파라미터 (선택 제품 등)
   */
  const requireAuth = (targetPage, params = {}) => {
    // ✅ 로그인 필요한 페이지만 여기에 넣기
    // (국가별 규제 정보는 정보성 페이지라면 굳이 로그인 강제 안 해도 됨)
    const protectedPages = ["products", "ingredient-check", "claim-check", "profile"];

    if (protectedPages.includes(targetPage)) {
      const token = localStorage.getItem("cosy_access_token");

      // 토큰이 없거나 만료된 경우
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

        // 로그인 후 원래 가려던 곳으로 복귀할 수 있게 저장
        setPendingNav({ targetPage, params });
        setCurrentPage("login");
        return;
      }
    }

    setPageParams(params || {});
    setCurrentPage(targetPage);
  };

  // 로그인 페이지는 레이아웃 숨김
  if (currentPage === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setCurrentPage("register")}
      />
    );
  }

  // 회원가입 페이지
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
        collapsed={sidebarCollapsed}                 
        onToggleCollapsed={toggleSidebarCollapsed}   
      />

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <Header
          onGoHome={() => setCurrentPage("home")}
          onGoProfile={() => requireAuth("profile")}   // ✅ 추가 (로그인 필요 처리까지 자동)
          onGoLogin={() => setCurrentPage("login")}
          isLoggedIn={isLoggedIn}
          userEmail={userEmail}
          loginType={loginType}
          onLogout={handleLogout}
        />

         <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: "100%",
          }}
        >
          <div style={{ flex: "1 0 auto", display: "flex", flexDirection: "column" }}>
            {/* Pages */}
            {currentPage === "home" && (
              <MainPage
                isLoggedIn={isLoggedIn}
                onGoLogin={() => setCurrentPage("login")}
                onGoProducts={() => requireAuth("products")}
                onDemoLogin={handleCoachDemoLogin}
              />
            )}

            {currentPage === "products" && <ProductsPage onNavigate={requireAuth} />}

            {currentPage === "ingredient-check" && (
              <IngredientCheckPage
                initialSelectedProducts={pageParams?.selectedProducts || []}
                initialSelectedProductIds={pageParams?.selectedProductIds || []}
              />
            )}

            {currentPage === "claim-check" && (
              <ClaimCheckPage
                initialSelectedProducts={pageParams?.selectedProducts || []}
                initialSelectedProductIds={pageParams?.selectedProductIds || []}
              />
            )}

            {currentPage === "profile" && <ProfilePage />}

            {/* ✅ 여기 추가가 핵심 */}
            {currentPage === "country-regulations" && <CountryRegulationsPage />}
          </div>

          <div style={{ marginTop: "auto" }}>
            <Footer />
          </div>
        </div>
      </div>

      {/* Chat */}
      <ChatWidget isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
    </div>
  );
}

