package com.aivle.cosy.controller;

import com.aivle.cosy.dto.UserInfoResponse;
import com.aivle.cosy.service.UserService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me")
public class UserProfileController {
    private final UserService userService;

    @GetMapping("")
    @NonNull
    public ResponseEntity<UserInfoResponse> me(@RequestHeader("Authorization") String token){
        if(token == null || !token.startsWith("Bearer ")){ // TODO: 검증용, 나중에 refactoring 가능
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String accessToken = token.substring(7);
        UserInfoResponse userInfoResponse = userService.getUserInfo(accessToken);
        return new ResponseEntity<>(userInfoResponse, HttpStatus.OK);
    }

    //TODO: 추가 될 수도 있는 사항: 유저 삭제, 비밀번호 변경
}
