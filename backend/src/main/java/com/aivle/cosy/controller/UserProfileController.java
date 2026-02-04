package com.aivle.cosy.controller;

import com.aivle.cosy.dto.ChangePasswordRequest;
import com.aivle.cosy.service.AuthService;
import com.aivle.cosy.service.UserService;
import com.aivle.cosy.util.CookieUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class UserProfileController {
    private final UserService userService;
    private final AuthService authService;

    //유저 삭제
    @DeleteMapping("")
    public ResponseEntity<Void> delete(@RequestHeader("Authorization") String token,
                                       @CookieValue(name = "refresh_token", required = false) String refreshToken) {
        if (token == null || !token.startsWith("Bearer ")) { // TODO: 검증용, 나중에 refactoring 가능
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);

        userService.deleteUser(accessToken, refreshToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtils.clearRefreshTokenCookie().toString())
                .build();
    }

    // 비밀번호 변경
    @PatchMapping("/password")
    public ResponseEntity<Void> password(@RequestHeader("Authorization") String token,
                                         @CookieValue(name = "refresh_token", required = false) String refreshToken,
                                         @RequestBody ChangePasswordRequest request) {
        if (token == null || !token.startsWith("Bearer ")) { // TODO: 검증용, 나중에 refactoring 가능
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);

        authService.changePassword(accessToken, refreshToken, request);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, CookieUtils.clearRefreshTokenCookie().toString())
                .build();
    }
}
