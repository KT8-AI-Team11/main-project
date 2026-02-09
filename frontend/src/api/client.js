// /**
//  * API 클라이언트 모듈
//  * - 모든 API 요청의 공통 로직 처리
//  * - 토큰 자동 갱신 (refresh) 로직 포함
//  * - 세션 만료 시 자동 로그아웃 처리
//  */

// const BASE = import.meta.env.VITE_API_BASE_URL;

// export class ApiError extends Error {
//   constructor(status, data) {
//     super(data?.message || `API Error ${status}`);
//     this.status = status;
//     this.data = data;
//   }
// }

// /**
//  * 모듈 레벨 상태 변수들
//  * - isRefreshing: 현재 refresh 요청 중인지 여부 (중복 요청 방지)
//  * - refreshPromise: 진행 중인 refresh Promise (여러 요청이 같은 Promise를 공유)
//  * - isLoggingOut: 로그아웃 처리 중인지 여부 (중복 alert/reload 방지)
//  */
// let isRefreshing = false;
// let refreshPromise = null;
// let isLoggingOut = false;

// /**
//  * Refresh Token으로 새 Access Token 발급
//  * - httpOnly 쿠키에 저장된 refresh token을 사용 (credentials: "include")
//  * - 성공 시 새 access token을 localStorage에 저장
//  */
// async function refreshToken() {
//   const res = await fetch(`${BASE}/api/auth/refresh`, {
//     method: "POST",
//     credentials: "include",  // 쿠키 포함 (refresh token)
//   });

//   if (!res.ok) {
//     throw new ApiError(res.status, null);
//   }

//   const data = await res.json();
//   localStorage.setItem("cosy_access_token", data.accessToken);
//   return data.accessToken;
// }

// /**
//  * 공통 API 요청 함수
//  * @param {string} path - API 경로 (예: "/api/users/me")
//  * @param {object} options - 요청 옵션
//  * @param {string} options.method - HTTP 메소드 (기본값: "GET")
//  * @param {object} options.body - 요청 바디 (자동으로 JSON 변환)
//  * @param {string} options.token - Access Token (Authorization 헤더에 추가)
//  * @param {boolean} options._retry - 내부용: 재시도 여부 (무한 루프 방지)
//  *
//  * 동작 흐름:
//  * 1. API 요청 실행
//  * 2. 401/403 응답 시 → refresh token으로 새 access token 발급 시도
//  * 3. 재발급 성공 → 새 토큰으로 원래 요청 재시도
//  * 4. 재발급 실패 또는 재시도도 실패 → 세션 만료 처리 (로그아웃)
//  */
// export async function apiFetch(path, { method = "GET", body, token, _retry = false } = {}) {
//   const res = await fetch(`${BASE}${path}`, {
//     method,
//     credentials: "include",  // 쿠키 포함 (refresh token용)
//     headers: {
//       ...(body ? { "Content-Type": "application/json" } : {}),
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//     body: body ? JSON.stringify(body) : undefined,
//   });

//   const data = await res.json().catch(() => null);

//   /**
//    * 케이스 1: 재시도(_retry=true)에서도 401/403 발생
//    * → refresh token도 만료됨 → 완전한 세션 만료 → 로그아웃 처리
//    */
//   if ((res.status === 401 || res.status === 403) && _retry) {
//     if (!isLoggingOut) {
//       isLoggingOut = true;
//       localStorage.removeItem("cosy_access_token");
//       localStorage.removeItem("cosy_logged_in");
//       localStorage.removeItem("cosy_user_email");
//       alert("세션이 만료되었습니다. 다시 로그인해주세요.");
//       // 페이지 reload 후 로그인 페이지로 이동하기 위한 플래그
//       sessionStorage.setItem("redirect_to_login", "true");
//       window.location.reload();
//     }
//     throw new ApiError(401, { message: "세션이 만료되었습니다." });
//   }

//   /**
//    * 케이스 2: 첫 요청에서 401/403 발생 (access token 만료)
//    * → refresh token으로 새 access token 발급 시도
//    */
//   // console.log('[client] status:', res.status, '_retry:', _retry, 'token:', !!token, 'isLoggingOut:', isLoggingOut);
//   if ((res.status === 401 || res.status === 403) && !_retry && token) {
//     // console.log('[client] refresh 시도...');
//     try {
//       // 동시에 여러 요청이 실패해도 refresh는 한 번만 실행
//       if (!isRefreshing) {
//         isRefreshing = true;
//         refreshPromise = refreshToken();
//       }

//       // 모든 실패한 요청이 같은 refresh Promise를 기다림
//       const newToken = await refreshPromise;
//       isRefreshing = false;
//       refreshPromise = null;

//       // 새 토큰으로 원래 요청 재시도 (_retry=true로 무한 루프 방지)
//       return apiFetch(path, { method, body, token: newToken, _retry: true });
//     } catch {
//       isRefreshing = false;
//       refreshPromise = null;

//       // refresh 실패 → 세션 만료 → 로그아웃 처리
//       if (!isLoggingOut) {
//         isLoggingOut = true;
//         localStorage.removeItem("cosy_access_token");
//         localStorage.removeItem("cosy_logged_in");
//         localStorage.removeItem("cosy_user_email");
//         alert("세션이 만료되었습니다. 다시 로그인해주세요.");
//         sessionStorage.setItem("redirect_to_login", "true");
//         window.location.reload();
//       }

//       throw new ApiError(401, { message: "세션이 만료되었습니다." });
//     }
//   }

//   // 그 외 에러는 그대로 throw
//   if (!res.ok) throw new ApiError(res.status, data);
//   return data;
// }

/**
 * API 클라이언트 모듈
 */

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
  // ✅ BASE가 비어있으면 그냥 /api/... 로 호출됨 (CloudFront 동일 도메인)
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
