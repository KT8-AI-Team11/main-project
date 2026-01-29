package com.aivle.cosy;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import com.aivle.cosy.service.UserService;

public class ValidationTests {
    private UserService userService;

    // 아무튼 복붙했고 클래스 구조 뜯어고쳐야겠지만 젠장.. 하기 싫어..
    private final static String EMAIL_REGEX = "^(?=.{5,254}$)[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private final static String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,72}$";
    @BeforeEach
    void setup() {
        // validation 테스트만 하므로 의존성은 null로 전달
        userService = new UserService(null, null, null, null, null);
    }
    // email validation check starts from here
    @Test
    @DisplayName("이메일 확인 - @이 없는 경우")
    void testEmailValidationWithoutAt() {
        String email = "testtesttestexample.com";
        assertFalse(userService.isValidFormat(email, EMAIL_REGEX));
    }

    @Test
    @DisplayName("이메일 확인 - @이 여러개 있는 경우")
    void testEmailValidationWithMultipleAt() {
        String email = "test@@example.co@m";
        assertFalse(userService.isValidFormat(email, EMAIL_REGEX));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 비어있는 경우")
    void testEmailValidationEmpty() {
        String email = "";
        assertFalse(userService.isValidFormat(email, EMAIL_REGEX));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 너무 짧을 경우")
    void testEmailValidationTooShort() {
        String email = "a@b.c";
        assertFalse(userService.isValidFormat(email, EMAIL_REGEX));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 너무 길 경우")
    void testEmailValidationTooLong() {
        String email = "a".repeat(250) + "@test.com";
        assertFalse(userService.isValidFormat(email, EMAIL_REGEX));
    }

    @Test
    @DisplayName("이메일 확인 - 정상 동작")
    void testEmailValidation() {
        String email = "banmnamoo12@test.com";
        assertTrue(userService.isValidFormat(email, EMAIL_REGEX));
    }

    // password validation check starts from here

    @Test
    @DisplayName("패스워드 확인 - 비어있는 경우")
    void testPasswordValidationEmpty() {
        String password = "";
        assertFalse(userService.isValidFormat(password, PASSWORD_REGEX));
    }

    @Test
    @DisplayName("패스워드 확인 - 너무 짧을 경우")
    void testPasswordValidationTooShort() {
        String password = "A!def";
        assertFalse(userService.isValidFormat(password, PASSWORD_REGEX));
    }

    @Test
    @DisplayName("패스워드 확인 - 대문자만 있을 경우")
    void testPasswordValidationOnlyUppercase() {
        String password = "ABCDEFGHIJ1!";
        assertFalse(userService.isValidFormat(password, PASSWORD_REGEX));
    }

    @Test
    @DisplayName("패스워드 확인 - 소문자만 있을 경우")
    void testPasswordValidationOnlyLowercase() {
        String password = "abcdefghij1!";
        assertFalse(userService.isValidFormat(password, PASSWORD_REGEX));
    }

    @Test
    @DisplayName("패스워드 확인 - 툭수문자가 없는 경우")
    void testPasswordValidationNoSpecialChar() {
        String password = "Abcdefghij1";
        assertFalse(userService.isValidFormat(password, PASSWORD_REGEX));
    }

    @Test
    @DisplayName("패스워드 확인 - 정상 동작")
    void testPasswordValidation() {
        String password = "Phoenix&Fire92";
        assertTrue(userService.isValidFormat(password, PASSWORD_REGEX));
    }


    // actual login/sign up test (아직 db 연결 안해둠)


}
