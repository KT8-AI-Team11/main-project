package com.aivle.cosy.controller;

import com.aivle.cosy.domain.Log;
import com.aivle.cosy.dto.DashboardResponse;
import com.aivle.cosy.repository.LogRepository;
import com.aivle.cosy.repository.ProductRepository;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final ProductRepository productRepository;
    private final LogRepository logRepository;
    private final JwtTokenProvider tokenProvider;

    @GetMapping("/stats")
    public ResponseEntity<DashboardResponse> getStats(
        @RequestHeader("Authorization") String bearerToken) {

        String token = bearerToken.substring(7);
        Long companyId = tokenProvider.getCompanyId(token);

        // 전체 제품 개수
        long productCount = productRepository.countByCompanyId(companyId);

        // 최근 7일 이내 로그 개수
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long recentChecks = logRepository.countByCompanyIdAndUpdDateAfter(companyId, weekAgo);

        // 위험도 MEDIUM, HIGH 개수
        List<Log.ApprovalStatus> warningLevels = Arrays.asList(
                Log.ApprovalStatus.MEDIUM,
                Log.ApprovalStatus.HIGH
        );
        long warningCount = logRepository.countByCompanyIdAndApprovalStatusIn(companyId, warningLevels);

        return ResponseEntity.ok(new DashboardResponse(productCount, recentChecks, warningCount));
    }
}
