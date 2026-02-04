import React, {useState} from "react";
import {Eye, EyeOff} from "lucide-react";
import {login} from "../api/auth.js";

export default function LoginPage({onLoginSuccess, onGoToRegister}) {

    // WARNING: SHOULD BE ALREADY STORED IN THE ACTUAL DB!!!
    const DEMO_EMAIL = "aivle@test.com";
    const DEMO_PASSWORD = "*Aivle0611!";

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
            const response = await login(email, pw);
            localStorage.setItem("cosy_access_token", response.accessToken);
            localStorage.setItem("cosy_logged_in", "true");
            localStorage.setItem("cosy_user_email", response.email);
            localStorage.setItem("cosy_company_name", response.companyName);
            onLoginSuccess();
        } catch (error) {
            setErrorMsg(error.data?.message || "로그인 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const onDemoLogin = async () => {
        setErrorMsg("");
        setLoading(true);

        try {
            // 반드시 DB에 데모 계정이 있어야함!!!
            const response = await login(DEMO_EMAIL, DEMO_PASSWORD);

            localStorage.setItem("cosy_access_token", response.accessToken);
            localStorage.setItem("cosy_logged_in", "true");
            localStorage.setItem("cosy_user_email", response.email);
            localStorage.setItem("cosy_company_name", response.companyName);

            onLoginSuccess();
        } catch (error) {
            setErrorMsg(error.data?.message || "데모 로그인에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // 2) 회원가입
    const onSignup = () => {
        // alert("회원가입 기능은 준비 중입니다.");
        onGoToRegister();
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
                <div style={{marginBottom: "18px"}}>
                    <div style={{fontSize: "24px", fontWeight: 800, color: "#111827"}}>
                        COSY 로그인
                    </div>
                    <div style={{marginTop: "6px", fontSize: "13px", color: "#6b7280"}}>
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
                    style={{display: "flex", flexDirection: "column", gap: "10px"}}
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

                    <div style={{position: "relative", width: "100%"}}>
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
                                <EyeOff size={18} color="#6b7280"/>
                            ) : (
                                <Eye size={18} color="#6b7280"/>
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

                        <span style={{color: "#d1d5db"}}>|</span>

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

                </form>
            </div>
        </div>
    );
}
