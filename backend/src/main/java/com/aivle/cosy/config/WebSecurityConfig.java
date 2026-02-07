package com.aivle.cosy.config;

import com.aivle.cosy.service.TokenBlacklistService;
import com.aivle.cosy.util.JwtFilter;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtTokenProvider jwtProvider;
    private final TokenBlacklistService tokenBlacklistService;

     @Bean
     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       http.addFilterBefore(
         new JwtFilter(jwtProvider,tokenBlacklistService),
         UsernamePasswordAuthenticationFilter.class
       );

       http.authorizeHttpRequests(auth -> auth
         .requestMatchers("/api/auth/login", "/login", "/api/data","/api/auth/signup","/api/auth/refresh","/api/auth/logout","/api/health").permitAll()
         .anyRequest().authenticated()
       );

       http.csrf(csrf -> csrf.disable()); // CSRF 보호 기능 비활성화
       http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
       // http.cors(cors -> cors.disable());
       return http.build();
     }


    @Bean
     public PasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder();
     }

     @Bean
     public CorsConfigurationSource corsConfigurationSource() {
       CorsConfiguration config = new CorsConfiguration();

       // 1. 허용할 출처 (우리 프론트엔드 주소)
       config.addAllowedOrigin("http://localhost:5173");
       config.addAllowedOrigin("http://127.0.0.1:5500");
       config.addAllowedOrigin("https://dd1luume97j85.cloudfront.net");
       config.addAllowedOrigin("http://cosy-alb-1486968001.ap-northeast-2.elb.amazonaws.com");

       // 2. 허용할 HTTP 메서드 (GET, POST, PUT, DELETE 등)
       config.addAllowedMethod("*");

       // 3. 허용할 헤더 (Authorization, Content-Type 등)
       config.addAllowedHeader("*");

       // 4. 내 자격증명(쿠키/인증토큰)을 허용할 것인가?
       config.setAllowCredentials(true);

       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
       source.registerCorsConfiguration("/**", config);
       return source;
     }


}
