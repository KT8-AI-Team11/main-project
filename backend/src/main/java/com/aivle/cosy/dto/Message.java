package com.aivle.cosy.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public enum Message {
    LOGIN_SUCCESS("로그인에 성공하였습니다."),
    SIGNUP_SUCCESS("회원가입에 성공하였습니다.");

    private String detail;
}
