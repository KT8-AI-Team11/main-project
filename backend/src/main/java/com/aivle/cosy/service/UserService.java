package com.aivle.cosy.service;


import com.aivle.cosy.domain.Company;
import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.dto.Message;
import com.aivle.cosy.exception.BusinessException;
import com.aivle.cosy.exception.LoginErrorCode;
import com.aivle.cosy.exception.SignUpErrorCode;
import com.aivle.cosy.repository.CompanyRepository;
import com.aivle.cosy.repository.UserRepository;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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
    private final PasswordEncoder passwordEncoder;
    private final static String EMAIL_REGEX = "^(?=.{5,254}$)[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private final static String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,72}$";



    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginInfo) {
        String email = loginInfo.getEmail();
        String password = loginInfo.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED));

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED);
        }

        LoginResponse response = new LoginResponse();
        response.setEmail(email);
        response.setToken(tokenProvider.createToken(email));
        response.setMessage(Message.LOGIN_SUCCESS);
        return response;
    }

    @Transactional
    public SignUpResponse signUp(SignUpRequest userInfo){
        String email = userInfo.getEmail();
        String password = userInfo.getPassword();

        // 1. 이메일 형식 검증 (정규식)
        if (!isValidFormat(email, EMAIL_REGEX))
            throw new BusinessException(SignUpErrorCode.INVALID_EMAIL_FORMAT);
        if (!isValidFormat(password, PASSWORD_REGEX))
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
     *
     * @param email
     */
    private void validateDuplicatedEmail(String email){
        userRepository.findByEmail(email)
                .ifPresent(u->{ throw new BusinessException(SignUpErrorCode.DUPLICATE_EMAIL); });

    }

    /**
     *
     * @param email
     * @return
     */
    private Company validateCompanyDomain(String email){
        String domain = email.substring(email.indexOf('@')+1);

        return companyRepository.findByDomain(domain)
                .orElseThrow(()-> new BusinessException(SignUpErrorCode.COMPANY_NOT_FOUND));
    }

    public boolean isValidFormat(String userInput, String regex){
        return userInput!=null && !userInput.isEmpty() && userInput.matches(regex);
    }


}
