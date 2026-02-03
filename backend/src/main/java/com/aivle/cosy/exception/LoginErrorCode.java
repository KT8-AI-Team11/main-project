package com.aivle.cosy.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum LoginErrorCode implements ErrorCode {
    AUTHENTICATION_FAILED(HttpStatus.UNAUTHORIZED, "존재하지 않는 이메일 또는 비밀번호입니다.");
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
