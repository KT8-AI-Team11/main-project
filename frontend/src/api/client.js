const BASE = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, data) {
    super(data?.message || `API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

// refresh 중복 요청 방지
let isRefreshing = false;
let refreshPromise = null;
let isLoggingOut = false;  // 중복 로그아웃 방지

async function refreshToken() {
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw new ApiError(res.status, null);
  }

  const data = await res.json();
  localStorage.setItem("cosy_access_token", data.accessToken);
  return data.accessToken;
}

export async function apiFetch(path, { method = "GET", body, token, _retry = false } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  // 재시도에서도 401/403이면 세션 만료 처리
  if ((res.status === 401 || res.status === 403) && _retry) {
    if (!isLoggingOut) {
      isLoggingOut = true;
      localStorage.removeItem("cosy_access_token");
      localStorage.removeItem("cosy_logged_in");
      localStorage.removeItem("cosy_user_email");
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      sessionStorage.setItem("redirect_to_login", "true");
      window.location.reload();
    }
    throw new ApiError(401, { message: "세션이 만료되었습니다." });
  }

  // 401/403 에러 && 재시도 아님 && 토큰 사용 요청인 경우 refresh 시도
  // console.log('[client] status:', res.status, '_retry:', _retry, 'token:', !!token, 'isLoggingOut:', isLoggingOut);
  if ((res.status === 401 || res.status === 403) && !_retry && token) {
    // console.log('[client] refresh 시도...');
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      // 새 토큰으로 원래 요청 재시도
      return apiFetch(path, { method, body, token: newToken, _retry: true });
    } catch {
      isRefreshing = false;
      refreshPromise = null;

      // refresh 실패 시 로그아웃 처리
      if (!isLoggingOut) {
        isLoggingOut = true;
        localStorage.removeItem("cosy_access_token");
        localStorage.removeItem("cosy_logged_in");
        localStorage.removeItem("cosy_user_email");
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
