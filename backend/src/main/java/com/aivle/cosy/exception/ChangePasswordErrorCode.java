package com.aivle.cosy.exception;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@RequiredArgsConstructor
public enum ChangePasswordErrorCode implements ErrorCode{
    CURRENT_PASSWORD_MISMATCH(HttpStatus.UNAUTHORIZED, "현재 비밀번호 확인 실패"),
    INVALID_PASSWORD_FORMAT(HttpStatus.BAD_REQUEST, "비밀번호는 알파벳 대소문자, 숫자, 특수기호(@$!%*?&) 포함 10자 이상이어야 합니다."),
    SAME_AS_OLD_PASSWORD(HttpStatus.BAD_REQUEST, "새 비밀번호는 기존 비밀번호와 달라야 합니다."),
    CHANGE_PASSWORD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요. 지속될 시, 관리자에게 문의하세요.");
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
