package com.aivle.cosy.service;

import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.ChangePasswordRequest;
import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.Message;
import com.aivle.cosy.dto.RefreshResponse;
import com.aivle.cosy.exception.AuthErrorCode;
import com.aivle.cosy.exception.BusinessException;
import com.aivle.cosy.exception.ChangePasswordErrorCode;
import com.aivle.cosy.exception.LoginErrorCode;
import com.aivle.cosy.exception.UserErrorCode;
import com.aivle.cosy.repository.UserRepository;
import com.aivle.cosy.security.JwtTokenProvider;
import com.aivle.cosy.util.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder passwordEncoder;

    // 로그인 서비스
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginInfo) {
        String email = loginInfo.getEmail();
        String password = loginInfo.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED);
        }

        LoginResponse response = new LoginResponse();
        response.setEmail(email);
        response.setCompanyName(user.getCompany().getCompanyName());
        response.setAccessToken(tokenProvider.createAccessToken(email, user.getCompany().getId()));
        response.setRefreshToken(tokenProvider.createRefreshToken(email));
        response.setMessage(Message.LOGIN_SUCCESS);
        return response;
    }

    // 로그아웃, 현재 유저의 access token과 refresh token이 유효할 경우, 블랙리스트에 저장.
    public void logout(String accessToken, String refreshToken) {
        tokenBlacklistService.invalidateSession(accessToken, refreshToken);
    }

    // access token 재발급용
    @Transactional(readOnly = true)
    public RefreshResponse refresh(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken) || tokenBlacklistService.isBlacklisted(refreshToken)) {
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }
        String email = tokenProvider.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        return new RefreshResponse(tokenProvider.createAccessToken(email, user.getCompany().getId()));
    }

    @Transactional
    public void changePassword(String accessToken, String refreshToken, ChangePasswordRequest request) {
        String email = tokenProvider.extractEmail(accessToken);
        String currentPassword = request.currentPassword();
        String newPassword = request.newPassword();

        // 먼저 유저가 존재 하는지 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        // 현재 패스워드가 db에 저장한거랑 똑같은지 확인(확인 절차)
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ChangePasswordErrorCode.CURRENT_PASSWORD_MISMATCH);
        }

        // 다음 변경할 패스워드가 유효한지 확인
        if (currentPassword.equals(newPassword)) {
            throw new BusinessException(ChangePasswordErrorCode.SAME_AS_OLD_PASSWORD);
        }

        if (!ValidationUtils.isValidPassword(newPassword)) {
            throw new BusinessException(ChangePasswordErrorCode.INVALID_PASSWORD_FORMAT);
        }

        // 확인 절차를 모두 통과했다면 주어진 password 인코딩해서 저장
        try {
            user.updatePassword(passwordEncoder.encode(newPassword));
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new BusinessException(ChangePasswordErrorCode.CHANGE_PASSWORD_FAILED, e.getMessage());
        }

        // 세션 만료
        tokenBlacklistService.invalidateSession(accessToken, refreshToken);
    }
}
