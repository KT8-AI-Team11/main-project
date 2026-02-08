package com.aivle.cosy.controller;

import com.aivle.cosy.domain.Log;
import com.aivle.cosy.dto.LogRequest;
import com.aivle.cosy.dto.LogResponse;
import com.aivle.cosy.service.LogService;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class LogController {
    private final LogService logService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping
    public ResponseEntity<String> saveOrUpdate(
            @RequestHeader(value = "Authorization") String bearerToken,
            @RequestBody LogRequest request) {

        log.info("saveOrUpdate 진입");
        String token = bearerToken.substring(7);
        Long companyId = tokenProvider.getCompanyId(token);

        logService.upsertLog(companyId, request);
        return ResponseEntity.ok("기록이 최신 상태로 저장되었습니다.");
    }

    @GetMapping("/ingredient")
    public ResponseEntity<List<LogResponse>> getIngredients(@RequestHeader("Authorization") String token) {
        log.info("getIngredients 진입");
        Long companyId = tokenProvider.getCompanyId(token.substring(7)); //
        return ResponseEntity.ok(logService.getIngredientLogsByCompany(companyId).stream()
                .filter(log -> log.getIngredientStatus() != null) // 성분 결과가 있는 것만
                .map(LogResponse::new).collect(Collectors.toList()));
    }

    @GetMapping("/ingredient/{country}")
    public ResponseEntity<List<LogResponse>> getIngredientsByCountry(
            @RequestHeader("Authorization") String token, @PathVariable String country) {
        log.info("getIngredientsByCountry 진입");
        Long companyId = tokenProvider.getCompanyId(token.substring(7));
        return ResponseEntity.ok(logService.getIngredientLogsByCountry(companyId, country).stream()
                .filter(log -> log.getIngredientStatus() != null)
                .map(LogResponse::new).collect(Collectors.toList()));
    }

    // 2. 문구 탭 데이터 조회
    @GetMapping("/marketing")
    public ResponseEntity<List<LogResponse>> getMarketings(@RequestHeader("Authorization") String token) {
        log.info("getMarketings 진입");
        Long companyId = tokenProvider.getCompanyId(token.substring(7));
        return ResponseEntity.ok(logService.getMarketingLogsByCompany(companyId).stream()
                .filter(log -> log.getMarketingStatus() != null) // 문구 결과가 있는 것만
                .map(LogResponse::new).collect(Collectors.toList()));
    }

    @GetMapping("/marketing/{country}")
    public ResponseEntity<List<LogResponse>> getMarketingsByCountry(
            @RequestHeader("Authorization") String token, @PathVariable String country) {
        log.info("getMarketingsByCountry 진입");
        Long companyId = tokenProvider.getCompanyId(token.substring(7));
        return ResponseEntity.ok(logService.getMarketingLogsByCountry(companyId, country).stream()
                .filter(log -> log.getMarketingStatus() != null)
                .map(LogResponse::new).collect(Collectors.toList()));
    }
}
