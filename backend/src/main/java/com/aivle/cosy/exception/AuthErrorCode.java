package com.aivle.cosy.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum AuthErrorCode implements ErrorCode {
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    INVALID_TOKEN_TYPE(HttpStatus.UNAUTHORIZED, "잘못된 토큰 타입입니다."),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다.");

    private final HttpStatus status;
    private final String message;

    @Override
    public HttpStatus defaultHttpStatus() {
        return this.status;
    }

    @Override
    public BusinessException defaultException() {
        return new BusinessException(this);
    }

    @Override
    public String defaultMessage() {
        return this.message;
    }
}
