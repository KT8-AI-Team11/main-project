package com.aivle.cosy.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum UserErrorCode implements ErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "주어진 이메일로 유저를 찾을 수 없습니다");

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

