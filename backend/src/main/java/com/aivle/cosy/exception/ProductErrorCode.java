package com.aivle.cosy.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ProductErrorCode implements ErrorCode {

    PRODUCT_NOT_FOUND(HttpStatus.NOT_FOUND, "해당 제품을 찾을 수 없습니다."),
    UNAUTHORIZED_ACCESS(HttpStatus.FORBIDDEN, "해당 제품에 대한 접근 권한이 없습니다."),
    INVALID_PRODUCT_DATA(HttpStatus.BAD_REQUEST, "제품 정보가 유효하지 않습니다.");

    private final HttpStatus httpStatus;
    private final String message;

    @Override
    public String defaultMessage() {
        return message;
    }

    @Override
    public HttpStatus defaultHttpStatus() {
        return httpStatus;
    }

    @Override
    public BusinessException defaultException() {
        return new BusinessException(this);
    }
}