package com.aivle.cosy.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
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

    public String createToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);
        Map<String, Object> claims = new HashMap<>();
        claims.put("email",email); // 나중에 필요시 확장, 변경


        return Jwts.builder()
                .subject(email)
                .claims(claims) // 나중에 필요시 확장, 변경
                .issuedAt(now)
                .issuer(issuer)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

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

    public boolean isTokenExpired(String token){
        try{
            return extractClaims(token).getExpiration().before(new Date());
        }catch(Exception e){ // token이 잘못 된 경우
            log.debug("잘못된 토큰");
            return false;
        }

    }

    public boolean validateToken(String token){
        try{
            return !isTokenExpired(token);
        }catch(Exception e){// token이 잘못된 경우
            return false;
        }
    }

}
