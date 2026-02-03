package com.aivle.cosy.dto;

public record ChangePasswordRequest(
        String currentPassword,
        String newPassword
) {
}
