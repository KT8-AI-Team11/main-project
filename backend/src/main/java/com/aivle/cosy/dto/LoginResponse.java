package com.aivle.cosy.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class LoginResponse {

    private String email;
    private Status status;
    private Message message;
    private String token;

    public enum Status{
        SUCCESS
    }

    @AllArgsConstructor
    @Getter
    public enum Message{
        SUCCESS(HttpStatus.OK,"로그인에 성공하였습니다.");

        private HttpStatus httpStatus;
        private String detail;
    }

}
