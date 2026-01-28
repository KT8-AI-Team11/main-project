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
    private Long accessExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private Long refreshExpiration;

    private final static String ACCESS = "access";

    private final static String REFRESH = "refresh";

    @PostConstruct
    public void initKey() {
        secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createAccessToken(String email, Long companyId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpiration);

        //Map<String, Object> claims = new HashMap<>();
        //claims.put("companyId",companyId); // 나중에 필요시 확장, 변경

        return Jwts.builder()
                .subject(email)
                //.claims(claims)
                .claim("companyId", companyId)
                .claim("type", ACCESS)
                .issuedAt(now)
                .issuer(issuer)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    //TODO: refresh token 발급
    public String createRefreshToken(String email) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .subject(email)
                .claim("type", REFRESH)
                .issuedAt(now)
                .issuer(issuer)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();

    }

    public long getRemainingExpiration(String token) {
        return extractClaims(token)
                .getExpiration()
                .toInstant()
                .toEpochMilli() - System.currentTimeMillis();
    }

    //TODO:필요시 protected나 private으로 변경
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateAccessToken(String token) {
        try {
            return isAccessToken(token);

        } catch (ExpiredJwtException e) {
            log.debug("토큰 만료: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.debug("토큰 형식 오류: {}", e.getMessage());
        } catch (SignatureException e) {
            log.debug("서명 불일치: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.debug("지원하지 않는 토큰: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.debug("토큰이 비어있음: {}", e.getMessage());
        }
        return false;
    }

    public boolean validateRefreshToken(String token) {
        try {
            return isRefreshToken(token);

        } catch (ExpiredJwtException e) {
            log.debug("토큰 만료: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.debug("토큰 형식 오류: {}", e.getMessage());
        } catch (SignatureException e) {
            log.debug("서명 불일치: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.debug("지원하지 않는 토큰: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.debug("토큰이 비어있음: {}", e.getMessage());
        }
        return false;
    }

    public boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("토큰 만료: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.debug("토큰 형식 오류: {}", e.getMessage());
        } catch (SignatureException e) {
            log.debug("서명 불일치: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.debug("지원하지 않는 토큰: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.debug("토큰이 비어있음: {}", e.getMessage());
        }
        return false;
    }


    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public Long extractCompanyId(String token) {
        return extractClaims(token).get("companyId", Long.class);
    }

    private String extractTokenType(String token) {
        return extractClaims(token).get("type", String.class);
    }


    private boolean isAccessToken(String token) {
        return ACCESS.equals(extractTokenType(token));
    }

    private boolean isRefreshToken(String token) {
        return REFRESH.equals(extractTokenType(token));
    }

}
