package com.aivle.cosy.service;


import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.LoginResponse.Message;
import com.aivle.cosy.dto.LoginResponse.Status;
import com.aivle.cosy.repository.UserRepository;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginInfo) {
        String email = loginInfo.getEmail();
        String password = loginInfo.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일 또는 비밀번호입니다.")); //TODO: 나중에 메시지 일괄작으로 변경

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("존재하지 않는 이메일 또는 비밀번호입니다.");
        }

        // 토큰 생성 시 유저가 속한 회사 ID 함께 전달
        Long companyId = (user.getCompany() != null) ? user.getCompany().getId() : null;
//        String token = tokenProvider.createToken(email,companyId);


        LoginResponse response = new LoginResponse();
        response.setEmail(email);
        response.setStatus(Status.SUCCESS);
        response.setToken(tokenProvider.createToken(email,companyId));
//        response.setToken(token);
        response.setMessage(Message.SUCCESS); //TODO: 나중에 메시지 일괄작으로 변경
        return response;
    }
}
