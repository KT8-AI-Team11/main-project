export default function LoginPage({ onBack }) {
  return (
    <div style={{ padding: 40 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>로그인</h2>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>로그인 기능은 현재 준비 중입니다.</p>
      <button
        onClick={onBack}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid #e5e7eb",
          background: "white",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        메인으로 돌아가기
      </button>
    </div>
  );
}