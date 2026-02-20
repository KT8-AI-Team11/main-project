const BASE = import.meta.env.VITE_V1_BASE_URL || import.meta.env.VITE_API_BASE_URL;

// ✅ 백엔드 최신 스펙
const PATH_LABELING = "/v1/compliance/labeling";
const PATH_INGREDIENTS = "/v1/compliance/ingredients";

function buildUrl(path) {
  // const base = BASE || window.location.origin;
  return new URL(path, BASE).toString();
}

function pickErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;
  // FastAPI 422 같은 경우 detail이 배열로 내려오는 케이스
  if (Array.isArray(data?.detail)) {
    const msgs = data.detail.map((x) => x?.msg).filter(Boolean);
    if (msgs.length) return msgs.join(", ");
  }
  return fallback;
}

// ✅ 문구 규제: POST /v1/compliance/labeling + JSON body { market, text }
export async function checkRegulation({ market, text }) {
  if (!market) throw new Error("market(국가 코드)이 없습니다.");
  if (!text || String(text).trim() === "") throw new Error("검사할 텍스트가 비어있습니다.");

  const res = await fetch(buildUrl(PATH_LABELING), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ market, text }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(pickErrorMessage(data, `문구 규제 검사 실패 (${res.status})`));
  }

  return data;
}

// ✅ 성분 규제: POST /v1/compliance/ingredients + JSON body { market, ingredients }
export async function checkIngredients({ market, ingredients }) {
  if (!market) throw new Error("market(국가 코드)이 없습니다.");
  if (!ingredients || String(ingredients).trim() === "") {
    throw new Error("ingredients(전성분 문자열)가 비어있습니다.");
  }

  const res = await fetch(buildUrl(PATH_INGREDIENTS), {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ market, ingredients }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(pickErrorMessage(data, `성분 규제 검사 실패 (${res.status})`));
  }

  return data;
}
