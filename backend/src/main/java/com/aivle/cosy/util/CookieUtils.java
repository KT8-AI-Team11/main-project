package com.aivle.cosy.util;

import org.springframework.http.ResponseCookie;

public class CookieUtils {
    private static final String REFRESH_TOKEN_NAME = "refresh_token";
    private static final String COOKIE_PATH = "/api";
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7일

    public static ResponseCookie createRefreshTokenCookie(String token) {
        return buildCookie(token, REFRESH_TOKEN_MAX_AGE);
    }

    public static ResponseCookie clearRefreshTokenCookie() {
        return buildCookie("", 0);
    }

    private static ResponseCookie buildCookie(String value, int maxAge) {
        return ResponseCookie.from(REFRESH_TOKEN_NAME,
                        value)
                .httpOnly(true)
                .path(COOKIE_PATH)
                .maxAge(maxAge) // 즉시 만료
                .secure(true)
                .sameSite("Strict")
                .build();
    }
}
