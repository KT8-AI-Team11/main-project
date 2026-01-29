package com.aivle.cosy.controller;

import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.RefreshResponse;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.service.UserService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
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

        ResponseCookie cookie = ResponseCookie.from("refresh_token",
                loginResponse.getRefreshToken())
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(7 * 24 * 60 * 60) // 7일
                .secure(true)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(loginResponse);
    }

    @PostMapping("/signup")
    @NonNull
    public ResponseEntity<SignUpResponse> signUp(@RequestBody SignUpRequest request){

        SignUpResponse signUpResponse= userService.signUp(request);
        return new ResponseEntity<>(signUpResponse,HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    @NonNull
    public ResponseEntity<RefreshResponse> refresh(@CookieValue(name = "refresh_token", required = false) String refreshToken
    ){
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return new ResponseEntity<>(userService.refresh(refreshToken), HttpStatus.OK);
    }

    @PostMapping("/logout")
    @NonNull
    public ResponseEntity<Void> logout(@RequestHeader("Authorization") String token, @CookieValue(name = "refresh_token", required = false) String refreshToken){

        if(token == null || !token.startsWith("Bearer ")){ // TODO: 검증용, 나중에 refactoring 가능
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);

        //refresh token 삭제
        ResponseCookie cookie = ResponseCookie.from("refresh_token",
                        "")
                .httpOnly(true)
                .path("/api/auth")
                .maxAge(0) // 즉시 만료
                .secure(true)
                .sameSite("Strict")
                .build();

        userService.logout(accessToken,refreshToken);
        return ResponseEntity.status(HttpStatus.OK).header(HttpHeaders.SET_COOKIE, cookie.toString()).build();
    }


}
