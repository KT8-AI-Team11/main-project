package com.aivle.cosy.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    private String companyName;
    private Message message;
    private String accessToken;
    @JsonIgnore
    private String refreshToken;
}
