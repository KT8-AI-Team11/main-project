//package com.aivle.cosy.config;
//
//import com.aivle.cosy.util.JwtFilter;
//import com.aivle.cosy.util.JwtTokenProvider;
//import lombok.RequiredArgsConstructor;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.web.SecurityFilterChain;
//import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.CorsConfigurationSource;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//@Configuration
//@EnableWebSecurity
//@RequiredArgsConstructor
//public class WebSecurityConfig {
//    private final JwtTokenProvider jwtProvider;
//
//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//       http.addFilterBefore(
//         new JwtFilter(jwtProvider),
//         UsernamePasswordAuthenticationFilter.class
//       );
//
//       //
//       http.authorizeHttpRequests(auth -> auth
//         .requestMatchers("/api/login", "/login", "/api/data").permitAll()
//         .anyRequest().authenticated()
//       );
//
//       http.csrf(csrf -> csrf.disable()); // CSRF 보호 기능 비활성화
//       http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
//       // http.cors(cors -> cors.disable());
//
//       return http.build();
//     }
//
//     @Bean
//     public PasswordEncoder passwordEncoder() {
//       return new BCryptPasswordEncoder();
//     }
//
//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//       CorsConfiguration config = new CorsConfiguration();
//
//       // 1. 허용할 출처 (우리 프론트엔드 주소)
//       config.addAllowedOrigin("http://localhost:3000");
//       config.addAllowedOrigin("http://127.0.0.1:5500");
//
//       // 2. 허용할 HTTP 메서드 (GET, POST, PUT, DELETE 등)
//       config.addAllowedMethod("*");
//
//       // 3. 허용할 헤더 (Authorization, Content-Type 등)
//       config.addAllowedHeader("*");
//
//       // 4. 내 자격증명(쿠키/인증토큰)을 허용할 것인가?
//       config.setAllowCredentials(true);
//
//       UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//       source.registerCorsConfiguration("/**", config);
//       return source;
//     }
//}

package com.aivle.cosy.config;

import com.aivle.cosy.util.JwtFilter;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
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

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // 1. HTTP Basic 및 Form Login을 명시적으로 비활성화 (가장 먼저 수행)
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())

                // 2. CSRF 비활성화
                .csrf(csrf -> csrf.disable())

                // 3. CORS 설정
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 4. 세션 정책을 STATELESS로 설정
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // 5. 권한 설정
                .authorizeHttpRequests(auth -> auth
                        // /api/login으로 시작하는 모든 요청을 허용 (오타 방지를 위해 /** 추가)
                        .requestMatchers("/api/login/**", "/login/**").permitAll()
                        .requestMatchers("/api/products/**", "/api/data/**").permitAll()
                        // 그 외에는 인증 필요
                        .anyRequest().authenticated()
                );

        // 6. JWT 필터를 UsernamePasswordAuthenticationFilter보다 앞에 배치
        http.addFilterBefore(new JwtFilter(jwtProvider), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // PasswordEncoder와 CorsConfigurationSource는 기존과 동일하게 유지
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*"); // 테스트를 위해 일시적으로 모든 도메인 허용
        config.addAllowedMethod("*");
        config.addAllowedHeader("*");
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}