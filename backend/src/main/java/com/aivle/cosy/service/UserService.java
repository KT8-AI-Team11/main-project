package com.aivle.cosy.service;


import com.aivle.cosy.domain.User;
import com.aivle.cosy.dto.LoginRequest;
import com.aivle.cosy.dto.LoginResponse;
import com.aivle.cosy.dto.LoginResponse.Message;
import com.aivle.cosy.dto.LoginResponse.Status;
import com.aivle.cosy.dto.SignUpRequest;
import com.aivle.cosy.dto.SignUpResponse;
import com.aivle.cosy.repository.CompanyRepository;
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
    private final CompanyRepository companyRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final static String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    private final static String PASSWORD_REGEX ="";

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest loginInfo) {
        String email = loginInfo.getEmail();
        String password = loginInfo.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일 또는 비밀번호입니다.")); //TODO: 나중에 메시지 일괄작으로 변경

        if(!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("존재하지 않는 이메일 또는 비밀번호입니다.");
        }

        LoginResponse response = new LoginResponse();
        response.setEmail(email);
        response.setStatus(Status.SUCCESS);
        response.setToken(tokenProvider.createToken(email));
        response.setMessage(Message.SUCCESS); //TODO: 나중에 메시지 일괄작으로 변경
        return response;
    }

    @Transactional
    public SignUpResponse signUp(SignUpRequest userInfo) throws Exception {
        String email = userInfo.getEmail();
        String password=userInfo.getPassword();

        // 1. 이메일 형식 검증 (정규식)

        if(!isValidFormat(email,EMAIL_REGEX)) throw new Exception(); //TODO
        if(!isValidFormat(password,PASSWORD_REGEX)) throw  new Exception(); //TODO
        // 2. 이메일 중복 확인 (userRepository)
            validateDuplicatedEmail(email);
        // 3. 이메일에서 도메인 추출 후 회사 조회 (companyRepository)
            validateCompanyDomain(email);
        // 4. 비밀번호 암호화

        // 5. User 생성 및 저장

        User user = new User(tlqkf );
        userRepository.save(user); // 문제 생겼을지 예외 발생

        // creates response here
        SignUpResponse response = new SignUpResponse();

        return response;
    }

    private void validateDuplicatedEmail(String email)throws Exception{
        userRepository.findByEmail(email)
                .ifPresent(u->{ throw new IllegalArgumentException("SOMETHING"); }); // TODO: 추후 수정

    }


    private void validateCompanyDomain(String email) throws Exception{
        String domain = email.substring(email.indexOf('@')+1);
        companyRepository.findByDomain(domain)
                .orElseThrow(()-> new IllegalArgumentException("SOMETHING")); //TODO: 추후 변경

    }

    private void validateEmail(String email,String password) throws Exception{

    }

    private void validatePassword(String password) throws Exception{

    }

    private boolean isValidFormat(String userInput, String regex){
        return !userInput.isEmpty() && userInput.matches(regex);
    }
}
