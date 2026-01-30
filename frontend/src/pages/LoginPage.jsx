import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios"; // API 통신을 위해 axios 권장 (또는 fetch 사용 가능)

export default function LoginPage({ onLoginSuccess }) {
    // 상태 관리
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 실제 백엔드 로그인 처리
    const onSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        if (!email.trim()) return setErrorMsg("이메일을 입력해주세요.");
        if (!pw.trim()) return setErrorMsg("비밀번호를 입력해주세요.");

        setLoading(true);

        try {
            // 백엔드 /api/auth/login API 호출
            const response = await axios.post("/api/auth/login", {
                email: email,
                password: pw
            });

            if (response.status === 200) {
                const { token, email: userEmail } = response.data;

                // 브라우저 저장소에 JWT 토큰 및 사용자 정보 저장
                localStorage.setItem("cosy_token", token);
                localStorage.setItem("cosy_user_email", userEmail);
                localStorage.setItem("cosy_logged_in", "true");

                setLoading(false);
                onLoginSuccess(); // home으로 이동
            }
        } catch (error) {
            setLoading(false);
            // 백엔드 BusinessException 메시지 처리
            if (error.response && error.response.data) {
                // BusinessException에서 정의한 에러 메시지 활용
                setErrorMsg("이메일 또는 비밀번호가 올바르지 않습니다.");
            } else {
                setErrorMsg("서버 연결에 실패했습니다. 관리자에게 문의하세요.");
            }
            console.error("Login Error:", error);
        }
    };

    // 임의 로그인 (백엔드에 테스트 계정이 있다는 가정 하에 API 호출 방식으로 변경 권장)
    const onDemoLogin = () => {
        setEmail("aivle@school.com");
        setPw("aivle0611");
        // 이후 onSubmit이 트리거되도록 유도하거나 직접 API 호출
    };

    // 회원가입 페이지 이동 혹은 모달 처리 (추후 구현)
    const onSignup = () => {
        alert("회원가입 기능은 API 연동 준비 중입니다.");
    };

    const onFindAccount = () => {
        alert("아이디/비밀번호 찾기 기능은 준비 중입니다.");
    };

    return (
        <div style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6", padding: "24px", fontFamily: "sans-serif" }}>
            <div style={{ width: "420px", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)", padding: "28px", overflow: "hidden" }}>
                <div style={{ marginBottom: "18px" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#111827" }}>COSY 로그인</div>
                    <div style={{ marginTop: "6px", fontSize: "13px", color: "#6b7280" }}>계정으로 로그인해 서비스를 이용하세요.</div>
                </div>

                {errorMsg && (
                    <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B", borderRadius: "12px", padding: "10px 12px", fontSize: "13px", marginBottom: "12px" }}>
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginTop: "6px" }}>이메일</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="aivle@school.com" style={{ height: "44px", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "0 12px", outline: "none", fontSize: "14px", width: "100%", boxSizing: "border-box" }} />

                    <label style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginTop: "6px" }}>비밀번호</label>
                    <div style={{ position: "relative", width: "100%" }}>
                        <input type={showPw ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="aivle0611" style={{ width: "100%", boxSizing: "border-box", height: "44px", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "0 44px 0 12px", outline: "none", fontSize: "14px" }} />
                        <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer" }}>
                            {showPw ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                        </button>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: "14px", height: "46px", borderRadius: "12px", border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 800, backgroundColor: "#3b82f6", color: "white", opacity: loading ? 0.8 : 1 }}>
                        {loading ? "로그인 중..." : "로그인"}
                    </button>

                    <button type="button" onClick={onDemoLogin} style={{ height: "46px", borderRadius: "12px", border: "1px solid #dbeafe", backgroundColor: "white", cursor: "pointer", fontWeight: 800, color: "#1d4ed8" }}>
                        임의 계정 입력
                    </button>

                    <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", gap: "14px", fontSize: "13px", color: "#6b7280" }}>
                        <button type="button" onClick={onSignup} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#374151", fontWeight: 700 }}>회원가입</button>
                        <span style={{ color: "#d1d5db" }}>|</span>
                        <button type="button" onClick={onFindAccount} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#374151", fontWeight: 700 }}>아이디/비밀번호 찾기</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
