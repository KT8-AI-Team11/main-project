package com.aivle.cosy.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.Jwts;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey secretKey;

    @Value("${jwt.issuer}")
    private String issuer;

    @Value("${jwt.access-token-expiration}")
    private Long expiration;

    @PostConstruct
    public void initKey(){
        secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

//    public String createToken(String email) {
    public String createToken(String email, Long companyId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        //Map<String, Object> claims = new HashMap<>();
        //claims.put("email",email); // 나중에 필요시 확장, 변경


        return Jwts.builder()
                .subject(email)
                //.claims(claims) // 나중에 필요시 확장, 변경
                .claim("companyId", companyId) // 회사 ID 추가
                .issuedAt(now)
                .issuer(issuer)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    //TODO:필요시 protected나 private으로 변경
    public Claims extractClaims(String token){
        return Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token){
        return extractClaims(token).getSubject();
    }

    public boolean validateToken(String token){
        try{
            extractClaims(token);
            return true;
        }catch(ExpiredJwtException e){
            log.debug("토큰 만료: {}", e.getMessage());
        }catch(MalformedJwtException e){
            log.debug("토큰 형식 오류: {}", e.getMessage());
        }catch(SignatureException e){
            log.debug("서명 불일치: {}", e.getMessage());
        }catch(UnsupportedJwtException e){
            log.debug("지원하지 않는 토큰: {}", e.getMessage());
        }catch(IllegalArgumentException e){
            log.debug("토큰이 비어있음: {}", e.getMessage());
        }
        return false;
    }

    // 회사 ID만 가져오는 메서드
    public Long getCompanyId(String token) {
        Claims claims = extractClaims(token); // 위 메서드 재사용
        return claims.get("companyId", Long.class); // 필요한 데이터만 타입 변환해서 반환
    }

}
