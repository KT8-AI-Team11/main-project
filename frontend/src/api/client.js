// /**
//  * API 클라이언트 모듈
//  * - 모든 API 요청의 공통 로직 처리
//  * - 토큰 자동 갱신 (refresh) 로직 포함
//  * - 세션 만료 시 자동 로그아웃 처리
//  */

function normalizeBaseUrl(v) {
  if (!v) return "";
  const s = String(v).trim();

  // GitHub Secret에 "" 넣어서 들어오는 케이스 방어
  if (s === '""' || s === "''") return "";

  // 끝 슬래시 제거
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

const BASE = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

let isRefreshing = false;
let refreshPromise = null;
let isLoggingOut = false;

async function refreshToken() {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) throw new ApiError(res.status, null);

  const data = await res.json();
  localStorage.setItem("cosy_access_token", data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path, { method = "GET", body, token, _retry = false } = {}) {
  // ✅ path는 이미 "/api/..." 형태니까 BASE가 ""이면 그대로 나감
  const url = `${BASE}${path}`;

  const isFormData = body instanceof FormData;
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      ...(!isFormData && body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const data = await res.json().catch(() => null);

  // 500대 에러는 콘솔에 출력
  if (res.status >= 500) {
    console.error("[API 5xx ERROR]", {
      url,
      method,
      status: res.status,
      response: data,
    });
  }

  if ((res.status === 401 || res.status === 403) && _retry) {
    if (!isLoggingOut) {
      isLoggingOut = true;
      localStorage.clear();
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      sessionStorage.setItem("redirect_to_login", "true");
      window.location.reload();
    }
    throw new ApiError(401, { message: "세션이 만료되었습니다." });
  }

  if ((res.status === 401 || res.status === 403) && !_retry && token) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      return apiFetch(path, { method, body, token: newToken, _retry: true });
    } catch {
      isRefreshing = false;
      refreshPromise = null;

      if (!isLoggingOut) {
        isLoggingOut = true;
        localStorage.clear();
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        sessionStorage.setItem("redirect_to_login", "true");
        window.location.reload();
      }

      throw new ApiError(401, { message: "세션이 만료되었습니다." });
    }
  }

  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
