package com.aivle.cosy.controller;

import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.RefreshRequest;
import com.aivle.cosy.dto.RefreshResponse;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.service.UserService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    @PostMapping("/login")
    @NonNull
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request){
        LoginResponse loginResponse = userService.login(request);
        return new ResponseEntity<>(loginResponse, HttpStatus.OK);
    }

    @PostMapping("/signup")
    @NonNull
    public ResponseEntity<SignUpResponse> signUp(@RequestBody SignUpRequest request){

        SignUpResponse signUpResponse= userService.signUp(request);
        return new ResponseEntity<>(signUpResponse,HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    @NonNull
    public ResponseEntity<RefreshResponse> refresh(@RequestBody RefreshRequest token){
        return new ResponseEntity<>(userService.refresh(token), HttpStatus.OK);
    }


}
