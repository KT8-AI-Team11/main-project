package com.aivle.cosy.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class LoginResponse {

    private String email;
    private Status status;
    private Message message;

    public enum Status{
        SUCCESS, FAILED
    }

    public enum Message{

    }

}
