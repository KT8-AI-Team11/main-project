import React from "react";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
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
    <footer
      style={{
        width: "100%",
        borderTop: "1px solid #e5e7eb",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <button
        type="button"
        onClick={openPrivacy}
        title="개인정보 처리 방침"
        aria-label="개인정보 처리 방침"
        style={{
          border: "none",
          background: "transparent",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "#6b7280",
          fontWeight: 700,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        <ShieldCheck style={{ width: 16, height: 16 }} />
        개인정보 처리 방침
      </button>
    </footer>
  );
}