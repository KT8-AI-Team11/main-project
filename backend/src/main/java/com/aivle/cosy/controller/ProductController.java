package com.aivle.cosy.controller;

import com.aivle.cosy.dto.ProductRequest;
import com.aivle.cosy.dto.ProductResponse;
import com.aivle.cosy.service.ProductService;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // React 기본 포트 허용
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {
    private final ProductService productService;
    private final JwtTokenProvider tokenProvider;

    // 전 제품 불러오기
    @GetMapping
    public ResponseEntity<List<ProductResponse.DetailResponse>> getMyCompanyProducts(
            @RequestHeader("Authorization") String bearerToken) {

        String token = bearerToken.substring(7); // "Bearer " 제거
        Long companyId = tokenProvider.getCompanyId(token); // 토큰에서 회사 ID 추출

        return ResponseEntity.ok(productService.getProducts(companyId));
    }

    // 제품 생성
    @PostMapping
    public ResponseEntity<ProductResponse.CreateResponse> createProduct(
            @RequestHeader("Authorization") String bearerToken,
            @RequestBody ProductRequest.SaveRequest request) {

        Long companyId = tokenProvider.getCompanyId(bearerToken.substring(7));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(companyId, request));
    }

    // 제품 수정
    @PatchMapping("/{id}")
    public ResponseEntity<ProductResponse.MessageResponse> patchProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String bearerToken,
            @RequestBody ProductRequest.SaveRequest request) {

        String token = bearerToken.substring(7);
        Long companyId = tokenProvider.getCompanyId(token);

        return ResponseEntity.ok(productService.updateProduct(id, companyId, request));
    }


    // 제품 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ProductResponse.MessageResponse> deleteProduct(
            @PathVariable Long id,
            @RequestHeader("Authorization") String bearerToken){

        String token = bearerToken.substring(7);
        Long companyId = tokenProvider.getCompanyId(token);

        return ResponseEntity.ok(productService.deleteProduct(id, companyId));
    }
}
