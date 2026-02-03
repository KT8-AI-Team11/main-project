package com.aivle.cosy.util;

public final class ValidationUtils {
    public static final String EMAIL_REGEX = "^(?=.{5,254}$)[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,72}$";

    private ValidationUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static boolean isValidFormat(String userInput, String regex) {
        return userInput != null && !userInput.isEmpty() && userInput.matches(regex);
    }

    public static boolean isValidEmail(String email) {
        return isValidFormat(email, EMAIL_REGEX);
    }

    public static boolean isValidPassword(String password) {
        return isValidFormat(password, PASSWORD_REGEX);
    }
}
