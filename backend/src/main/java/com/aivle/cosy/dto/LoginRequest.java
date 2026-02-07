package com.aivle.cosy.dto;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class
LoginRequest {
    private String email;
    private String password;
}
