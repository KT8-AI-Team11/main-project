import { apiFetch } from "./client";

/**
 * JWT 토큰 디코딩 함수
 * - JWT는 header.payload.signature 형태로 구성됨
 * - payload 부분을 base64 디코딩하여 JSON 객체로 변환
 * - 만료 시간(exp) 등의 클레임 정보를 추출할 때 사용
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    // JWT의 두 번째 부분(payload)을 추출
    const payload = token.split('.')[1];
    // base64 디코딩 후 JSON 파싱
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

/**
 * 토큰 만료 여부 확인 함수
 * - 메뉴 접근 시 API 호출 전에 토큰 유효성을 미리 체크
 * - 만료된 토큰으로 불필요한 API 요청을 방지
 */
export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  // 디코딩 실패하거나 exp 클레임이 없으면 만료된 것으로 처리
  if (!decoded || !decoded.exp) return true;
  // exp는 초 단위 Unix timestamp, Date.now()는 ms 단위이므로 1000을 곱함
  return decoded.exp * 1000 < Date.now();
};

export const login = (email, password) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

export const signup = (email, password) =>
  apiFetch("/api/auth/signup", {
    method: "POST",
    body: { email, password },
  });

export const logout = (accessToken) =>
    apiFetch("/api/auth/logout", {
        method: "POST",
        token: accessToken,
    })

export const refresh = () =>
    apiFetch("/api/auth/refresh", {
        method: "POST",
    })

export const changePassword = (accessToken, currentPassword, newPassword) =>
    apiFetch("/api/users/me/password", {
        method: "PATCH",
        token: accessToken,
        body: { currentPassword, newPassword },
    })

export const deleteAccount = (accessToken) =>
    apiFetch("/api/users/me", {
        method: "DELETE",
        token: accessToken,
    })