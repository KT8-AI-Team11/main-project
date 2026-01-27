package com.aivle.cosy.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum SignUpErrorCode implements ErrorCode{
    INVALID_EMAIL_FORMAT(HttpStatus.BAD_REQUEST, "이메일 형식이 올바르지 않습니다."),
    INVALID_PASSWORD_FORMAT(HttpStatus.BAD_REQUEST, "비밀번호는 알파벳 대소문자, 숫자, 특수기호(@$!%*?&) 포함 10자 이상이여야합니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT,"이미 가입한 이메일입니다."),
    COMPANY_NOT_FOUND(HttpStatus.NOT_FOUND,"회사를 찾을 수 없습니다."),
    SIGN_UP_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 지속될 시, 관리자에게 문의하세요.");

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
