import { apiFetch } from "./client";

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

export const refresh = (accessToken) =>
    apiFetch("/api/auth/refresh", {
        method: "POST",
    })