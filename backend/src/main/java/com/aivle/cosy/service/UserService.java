package com.aivle.cosy.service;


import com.aivle.cosy.domain.Company;
import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.dto.Message;
import com.aivle.cosy.exception.BusinessException;
import com.aivle.cosy.exception.UserErrorCode;
import com.aivle.cosy.exception.SignUpErrorCode;
import com.aivle.cosy.repository.CompanyRepository;
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
public class UserService {
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JwtTokenProvider tokenProvider;
    private final TokenBlacklistService tokenBlacklistService;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원 가입 서비스
     * @param userInfo
     * @return
     */
    @Transactional
    public SignUpResponse signUp(SignUpRequest userInfo){
        String email = userInfo.getEmail();
        String password = userInfo.getPassword();

        // 1. 이메일 형식 검증 (정규식)
        if (!ValidationUtils.isValidEmail(email))
            throw new BusinessException(SignUpErrorCode.INVALID_EMAIL_FORMAT);
        if (!ValidationUtils.isValidPassword(password))
            throw new BusinessException(SignUpErrorCode.INVALID_PASSWORD_FORMAT);
        // 2. 이메일 중복 확인 (userRepository)
        validateDuplicatedEmail(email);
        // 3. 이메일에서 도메인 추출 후 회사 조회 (companyRepository)
        Company company = validateCompanyDomain(email);
        // 4. 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);
        // 5. User 생성 및 저장
        User user = new User(company, email, encodedPassword);
        try {
            userRepository.save(user); // 문제 생겼을지 예외 발생
        } catch(Exception e) {
            log.error(e.getMessage(),e);
            throw new BusinessException(SignUpErrorCode.SIGN_UP_FAILED, e.getMessage());
        }

        // creates response here
        SignUpResponse response = new SignUpResponse();
        response.setMessage(Message.SIGNUP_SUCCESS);
        return response;
    }


    /**
     * 유저 삭제, access token에서 현재 유저의 이메일을 추출한다음 삭제
     * @param accessToken
     */
    @Transactional
    public void deleteUser(String accessToken, String refreshToken){
        String email = tokenProvider.extractEmail(accessToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        tokenBlacklistService.invalidateSession(accessToken,refreshToken);
        userRepository.delete(user);
    }

    /**
     * 로그인시 중복된 이메일인지 확인하는 helper function
     * @param email
     */
    private void validateDuplicatedEmail(String email){
        userRepository.findByEmail(email)
                .ifPresent(u->{ throw new BusinessException(SignUpErrorCode.DUPLICATE_EMAIL); });

    }

    /**
     * 등록된 회사 도메인인지 확인하는 helper function
     * @param email
     * @return
     */
    private Company validateCompanyDomain(String email){
        String domain = email.substring(email.indexOf('@')+1);

        return companyRepository.findByDomain(domain)
                .orElseThrow(()-> new BusinessException(SignUpErrorCode.COMPANY_NOT_FOUND));
    }
}
