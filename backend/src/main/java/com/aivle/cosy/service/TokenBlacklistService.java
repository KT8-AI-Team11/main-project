package com.aivle.cosy.service;

import com.aivle.cosy.util.JwtTokenProvider;
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
        String key = BLACKLIST_PREFIX + jwtTokenProvider.extractJti(token);

        if(expirationMs < 0) return; // 유효기간이 만료된 토큰일 경우
        // value에 아무 의미 없는 String도 라고?? 왜지
        redisTemplate.opsForValue().set(key,"1",expirationMs,TimeUnit.MILLISECONDS);
    }

    /**
     * 토큰이 블랙리스트에 있는지 확인
     */
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + jwtTokenProvider.extractJti(token);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
