package com.aivle.cosy.exception;

import org.springframework.http.HttpStatus;

public interface ErrorCode {
    default String code(){
        if (!(this instanceof Enum<?>)) {
            throw new IllegalStateException("ErrorCode must be implemented by Enum");
        }
        return ((Enum<?>) this).name();
    }
    String defaultMessage();
    HttpStatus defaultHttpStatus();
    BusinessException defaultException();
}
