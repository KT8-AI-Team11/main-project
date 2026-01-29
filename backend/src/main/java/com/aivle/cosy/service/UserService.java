package com.aivle.cosy.service;


import com.aivle.cosy.domain.Company;
import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.RefreshResponse;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.dto.Message;
import com.aivle.cosy.dto.UserInfoResponse;
import com.aivle.cosy.exception.AuthErrorCode;
import com.aivle.cosy.exception.BusinessException;
import com.aivle.cosy.exception.LoginErrorCode;
import com.aivle.cosy.exception.UserErrorCode;
import com.aivle.cosy.exception.SignUpErrorCode;
import com.aivle.cosy.repository.CompanyRepository;
import com.aivle.cosy.repository.UserRepository;
import com.aivle.cosy.util.JwtTokenProvider;
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
    private final static String EMAIL_REGEX = "^(?=.{5,254}$)[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private final static String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{10,72}$";


    /**
     * 로그인 서비스
     * @param loginInfo
     * @return
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginInfo) {
        String email = loginInfo.getEmail();
        String password = loginInfo.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED));

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(LoginErrorCode.AUTHENTICATION_FAILED);
        }

        // response 작성
        LoginResponse response = new LoginResponse();
        response.setEmail(email);
        response.setAccessToken(tokenProvider.createAccessToken(email,user.getCompany().getId()));
        response.setRefreshToken(tokenProvider.createRefreshToken(email));
        response.setMessage(Message.LOGIN_SUCCESS);
        return response;
    }

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
     * 마이페이지 정보 조회
     *
     * @param accessToken : 조회에 필요한 토큰
     * @return 아이디에 해당하는 정보
     */
    @Transactional(readOnly = true)
    public UserInfoResponse getUserInfo(String accessToken){
        String email = tokenProvider.extractEmail(accessToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));

        return new UserInfoResponse(user.getEmail(), user.getCompany().getCompanyName());

    }

    /**
     * access token 재발급용
     * @param refreshToken
     * @return
     */
    @Transactional(readOnly = true)
    public RefreshResponse refresh (String refreshToken){
        // 로그아웃해서 토큰이 더이상 유효하지 않거나 토큰이 잘못된 경우 체크
        if(!tokenProvider.validateRefreshToken(refreshToken) || tokenBlacklistService.isBlacklisted(refreshToken)){
            throw new BusinessException(AuthErrorCode.INVALID_TOKEN);
        }
        String email = tokenProvider.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(UserErrorCode.USER_NOT_FOUND));
        return new RefreshResponse(tokenProvider.createAccessToken(email,user.getCompany().getId()));
    }

    /**
     *
     */
    public void logout(String accessToken, String refreshToken){
        tokenBlacklistService.addToBlacklist(accessToken,tokenProvider.getRemainingExpiration(accessToken));
        tokenBlacklistService.addToBlacklist(refreshToken,tokenProvider.getRemainingExpiration(refreshToken));
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

    /**
     * 정규식 확인용 helper function, 추후 util로 뺄거임
     * @param userInput
     * @param regex
     * @return
     */
    public boolean isValidFormat(String userInput, String regex){
        return userInput!=null && !userInput.isEmpty() && userInput.matches(regex);
    }


}
