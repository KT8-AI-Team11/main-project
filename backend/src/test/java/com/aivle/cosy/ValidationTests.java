package com.aivle.cosy;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.aivle.cosy.util.ValidationUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

public class ValidationTests {

    // email validation check starts from here
    @Test
    @DisplayName("이메일 확인 - @이 없는 경우")
    void testEmailValidationWithoutAt() {
        String email = "testtesttestexample.com";
        assertFalse(ValidationUtils.isValidEmail(email));
    }

    @Test
    @DisplayName("이메일 확인 - @이 여러개 있는 경우")
    void testEmailValidationWithMultipleAt() {
        String email = "test@@example.co@m";
        assertFalse(ValidationUtils.isValidEmail(email));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 비어있는 경우")
    void testEmailValidationEmpty() {
        String email = "";
        assertFalse(ValidationUtils.isValidEmail(email));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 너무 짧을 경우")
    void testEmailValidationTooShort() {
        String email = "a@b.c";
        assertFalse(ValidationUtils.isValidEmail(email));
    }

    @Test
    @DisplayName("이메일 확인 - 이메일이 너무 길 경우")
    void testEmailValidationTooLong() {
        String email = "a".repeat(250) + "@test.com";
        assertFalse(ValidationUtils.isValidEmail(email));
    }

    @Test
    @DisplayName("이메일 확인 - 정상 동작")
    void testEmailValidation() {
        String email = "banmnamoo12@test.com";
        assertTrue(ValidationUtils.isValidEmail(email));
    }

    // password validation check starts from here

    @Test
    @DisplayName("패스워드 확인 - 비어있는 경우")
    void testPasswordValidationEmpty() {
        String password = "";
        assertFalse(ValidationUtils.isValidPassword(password));
    }

    @Test
    @DisplayName("패스워드 확인 - 너무 짧을 경우")
    void testPasswordValidationTooShort() {
        String password = "A!def";
        assertFalse(ValidationUtils.isValidPassword(password));
    }

    @Test
    @DisplayName("패스워드 확인 - 대문자만 있을 경우")
    void testPasswordValidationOnlyUppercase() {
        String password = "ABCDEFGHIJ1!";
        assertFalse(ValidationUtils.isValidPassword(password));
    }

    @Test
    @DisplayName("패스워드 확인 - 소문자만 있을 경우")
    void testPasswordValidationOnlyLowercase() {
        String password = "abcdefghij1!";
        assertFalse(ValidationUtils.isValidPassword(password));
    }

    @Test
    @DisplayName("패스워드 확인 - 툭수문자가 없는 경우")
    void testPasswordValidationNoSpecialChar() {
        String password = "Abcdefghij1";
        assertFalse(ValidationUtils.isValidPassword(password));
    }

    @Test
    @DisplayName("패스워드 확인 - 정상 동작")
    void testPasswordValidation() {
        String password = "Phoenix&Fire92";
        assertTrue(ValidationUtils.isValidPassword(password));
    }


    // actual login/sign up test (아직 db 연결 안해둠)


}
