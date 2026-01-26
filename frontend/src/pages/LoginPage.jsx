import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage({ onLoginSuccess }) {
  // ✅ [DEMO ONLY] 임시 통과 계정 (프론트에서 검증 = 보안 X)
  // TODO(백엔드 연동 시): 이 상수와 프론트 검증 로직은 제거하고,
  //  백엔드 /auth/login API 호출 결과로 성공/실패를 판단하세요.
  const DEMO_EMAIL = "aivle@school.com";
  const DEMO_PASSWORD = "aivle0611";

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) return setErrorMsg("이메일을 입력해주세요.");
    if (!pw.trim()) return setErrorMsg("비밀번호를 입력해주세요.");

    setLoading(true);

    // ✅ [DEMO ONLY] 프론트에서 임시 계정 검증 (보안 X)
    // TODO(백엔드 연동 시): 아래 로직 삭제하고,
    //   1) POST `${API_BASE_URL}/auth/login` 로 { email, password: pw } 전송
    //   2) 성공 시 토큰/세션 저장 (예: localStorage or cookie)
    //   3) onLoginSuccess() 호출
    setTimeout(() => {
      const ok = email.trim() === DEMO_EMAIL && pw === DEMO_PASSWORD;

      if (!ok) {
        setLoading(false);
        setErrorMsg("아이디 또는 비밀번호가 올바르지 않습니다.");
        return;
      }

      // 로그인 성공(데모)
      localStorage.setItem("cosy_logged_in", "true");
      localStorage.setItem("cosy_login_type", "demo-credential");
      localStorage.setItem("cosy_user_email", DEMO_EMAIL);

      setLoading(false);
      onLoginSuccess(); // home으로 이동
    }, 400);
  };

  // 1) 임의 로그인 (코치/시연용)
  const onDemoLogin = () => {
    setErrorMsg("");
    setLoading(true);

    // ✅ [DEMO ONLY] 입력 없이 로그인 처리
    // TODO(백엔드 연동 시): 필요하다면 "테스트 계정 로그인" API로 대체
    setTimeout(() => {
      localStorage.setItem("cosy_logged_in", "true");
      localStorage.setItem("cosy_login_type", "demo-oneclick");
      localStorage.setItem("cosy_user_email", "coach-demo");

      setLoading(false);
      onLoginSuccess();
    }, 250);
  };

  // 2) 회원가입 (준비중)
  const onSignup = () => {
    alert("회원가입 기능은 준비 중입니다.");
  };

  // 3) 아이디/비밀번호 찾기 (준비중)
  const onFindAccount = () => {
    alert("아이디/비밀번호 찾기 기능은 준비 중입니다.");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        padding: "24px",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          width: "420px",
          backgroundColor: "white",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)",
          padding: "28px",
          overflow: "hidden",
        }}
      >
        <div style={{ marginBottom: "18px" }}>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827" }}>
            COSY 로그인
          </div>
          <div style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
            계정으로 로그인해 서비스를 이용하세요.
          </div>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              borderRadius: "12px",
              padding: "10px 12px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              marginTop: "6px",
            }}
          >
            이메일
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="aivle@school.com"
            autoComplete="email"
            style={{
              height: "44px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              padding: "0 12px",
              outline: "none",
              fontSize: "14px",
              width: "100%",
              boxSizing: "border-box",
              display: "block",
            }}
          />

          <label
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#374151",
              marginTop: "6px",
            }}
          >
            비밀번호
          </label>

          <div style={{ position: "relative", width: "100%" }}>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="aivle0611"
              autoComplete="current-password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                display: "block",
                height: "44px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                padding: "0 44px 0 12px",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 0,
              }}
              aria-label="비밀번호 보기 토글"
            >
              {showPw ? (
                <EyeOff size={18} color="#6b7280" />
              ) : (
                <Eye size={18} color="#6b7280" />
              )}
            </button>
          </div>

          {/* 일반 로그인 */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "14px",
              height: "46px",
              borderRadius: "12px",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              backgroundColor: "#3b82f6",
              color: "white",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>

          {/* 1) 임의 로그인 */}
          <button
            type="button"
            onClick={onDemoLogin}
            disabled={loading}
            style={{
              height: "46px",
              borderRadius: "12px",
              border: "1px solid #dbeafe",
              backgroundColor: "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 800,
              color: "#1d4ed8",
            }}
          >
            임의 로그인(코치 확인용)
          </button>

          {/* 2) 회원가입 / 3) 아이디·비번 찾기 */}
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            <button
              type="button"
              onClick={onSignup}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#374151",
                fontWeight: 700,
              }}
            >
              회원가입
            </button>

            <span style={{ color: "#d1d5db" }}>|</span>

            <button
              type="button"
              onClick={onFindAccount}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#374151",
                fontWeight: 700,
              }}
            >
              아이디/비밀번호 찾기
            </button>
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "12px",
              color: "#9ca3af",
              textAlign: "center",
            }}
          >
            * 현재는 데모 로그인 단계이며, 기능은 추후 백엔드 연동 예정입니다.
          </div>
        </form>
      </div>
    </div>
  );
}
