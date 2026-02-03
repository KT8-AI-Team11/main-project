import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "../api/auth";

export default function RegisterPage({ onRegisterSuccess, onBackToLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) return setErrorMsg("이메일을 입력해주세요.");
    if (!pw.trim()) return setErrorMsg("비밀번호를 입력해주세요.");

    setLoading(true);

    try {
      await signup(email, pw);
      alert("회원가입이 완료되었습니다.");
      onRegisterSuccess();
    } catch (error) {
      setErrorMsg(error.data?.message || "회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
            COSY 회원가입
          </div>
          <div style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>
            새로운 계정을 만들어 서비스를 이용하세요.
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
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
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
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
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <div
            style={{
              marginTop: "8px",
              display: "flex",
              justifyContent: "center",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            <span>이미 계정이 있으신가요?</span>
            <button
              type="button"
              onClick={onBackToLogin}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#3b82f6",
                fontWeight: 700,
                marginLeft: "8px",
              }}
            >
              로그인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
