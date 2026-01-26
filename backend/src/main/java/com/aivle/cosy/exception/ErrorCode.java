package com.aivle.cosy.exception;

import org.springframework.http.HttpStatus;

public interface ErrorCode {
    String defaultMessage();
    HttpStatus defaultHttpStatus();
    BusinessException defaultException();
}
