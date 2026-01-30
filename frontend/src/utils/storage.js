// src/utils/storage.js
export const LS_KEYS = {
  LOGGED_IN: "cosy_logged_in",
  LOGIN_TYPE: "cosy_login_type",
  USER_EMAIL: "cosy_user_email",
  TOKEN: "cosy_access_token",

  // (선택) ProductsPage에서 선택된 상품 id를 저장해두면 ClaimCheckPage에서 바로 쓸 수 있음
  SELECTED_PRODUCT_ID: "cosy_selected_product_id",
};

export const authStorage = {
  getToken() {
    return localStorage.getItem(LS_KEYS.TOKEN) || "";
  },
  setToken(token) {
    if (token) localStorage.setItem(LS_KEYS.TOKEN, token);
  },
  clearAuth() {
    localStorage.removeItem(LS_KEYS.LOGGED_IN);
    localStorage.removeItem(LS_KEYS.LOGIN_TYPE);
    localStorage.removeItem(LS_KEYS.USER_EMAIL);
    localStorage.removeItem(LS_KEYS.TOKEN);
  },
};
