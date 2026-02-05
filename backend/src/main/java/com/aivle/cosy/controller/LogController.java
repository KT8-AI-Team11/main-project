package com.aivle.cosy.controller;

import com.aivle.cosy.domain.Log;
import com.aivle.cosy.dto.LogRequest;
import com.aivle.cosy.dto.LogResponse;
import com.aivle.cosy.service.LogService;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

        String token = bearerToken.substring(7);
        Long companyId = tokenProvider.getCompanyId(token);

        logService.upsertLog(companyId, request);
        return ResponseEntity.ok("기록이 최신 상태로 저장되었습니다.");
    }

    @GetMapping
    public ResponseEntity<List<LogResponse>> getAll(
            @RequestHeader("Authorization") String token) {
        Long companyId = tokenProvider.getCompanyId(token.substring(7));
        List<Log> logs = logService.getAllLogsByCompany(companyId);
        List<LogResponse> response = logs.stream()
                .map(LogResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{country}")
    public ResponseEntity<List<Log>> getByCountry(
            @RequestHeader("Authorization") String token,
            @PathVariable String country) {
        Long companyId = tokenProvider.getCompanyId(token.substring(7));
        return ResponseEntity.ok(logService.getLogsByCountry(companyId, country));
    }
}
