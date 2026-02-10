package com.aivle.cosy.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SignUpRequest {
    private String email;
    private String password;

}
