package com.aivle.cosy.service;

import com.aivle.cosy.security.JwtTokenProvider;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private static final String BLACKLIST_PREFIX = "blacklist:";

    private final StringRedisTemplate redisTemplate;
    private final JwtTokenProvider jwtTokenProvider;


    /**
     * 토큰을 블랙리스트에 추가
     * @param token JWT 토큰
     * @param expirationMs 토큰의 남은 만료 시간 (밀리초)
     */
    public void addToBlacklist(String token, long expirationMs) {
        String jti = jwtTokenProvider.extractJti(token);
        if (jti == null || expirationMs < 0) return;

        String key = BLACKLIST_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "1", expirationMs, TimeUnit.MILLISECONDS);
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인
     */
    public boolean isBlacklisted(String token) {
        String jti = jwtTokenProvider.extractJti(token);
        if (jti == null) return false;

        String key = BLACKLIST_PREFIX + jti;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    public void invalidateSession(String accessToken, String refreshToken) {
        addToBlacklist(accessToken, jwtTokenProvider.getRemainingExpiration(accessToken));
        addToBlacklist(refreshToken, jwtTokenProvider.getRemainingExpiration(refreshToken));
    }
}
