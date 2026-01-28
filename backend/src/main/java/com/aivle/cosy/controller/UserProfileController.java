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
        String accessToken = token.replace("Bearer ", "");
        UserInfoResponse userInfoResponse = userService.getUserInfo(accessToken);
        return new ResponseEntity<>(userInfoResponse, HttpStatus.OK);
    }

    //TODO: 추가 될 수도 있는 사항: 유저 삭제, 비밀번호 변경
}
