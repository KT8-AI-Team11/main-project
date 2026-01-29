// src/api/compliance.js
// DEV: base="" -> /v1/... 상대경로 호출 -> vite proxy가 FastAPI(8000)로 전달
// PROD: 필요하면 VITE_COMPLIANCE_BASE_URL로 base 지정 가능

const COMPLIANCE_BASE_PROD =
  import.meta.env.VITE_COMPLIANCE_BASE_URL ||
  import.meta.env.VITE_COMPLIANCE_API_BASE ||
  "";

const BASE = import.meta.env.DEV ? "" : COMPLIANCE_BASE_PROD;

// ✅ 백엔드가 준 주소
const PATH = "/v1/compliance/check-regulation";

function buildUrl({ market, text, domain = "labeling" }) {
  const base = BASE || window.location.origin;
  const u = new URL(PATH, base);
  u.searchParams.set("market", market);
  u.searchParams.set("text", text);
  u.searchParams.set("domain", domain);
  return u.toString();
}

export async function checkRegulation({ market, text, domain = "labeling" }) {
  if (!market) throw new Error("market(국가 코드)이 없습니다.");
  if (!text || String(text).trim() === "") throw new Error("검사할 텍스트가 비어있습니다.");

  // ✅ FastAPI 라우터가 POST이고, 파라미터는 query로 받는 형태라 POST + query가 안전
  const res = await fetch(buildUrl({ market, text, domain }), {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.detail || data?.message || `규제 검사 실패 (${res.status})`;
    throw new Error(msg);
  }

  return data;
}
