package com.aivle.cosy.controller;

import com.aivle.cosy.dto.ProductCreateRequest;
import com.aivle.cosy.dto.ProductCreateResponse;
import com.aivle.cosy.dto.ProductUpdateRequest;
import com.aivle.cosy.service.ProductService;
import com.aivle.cosy.util.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final JwtTokenProvider jwtProvider;

    // 제품 등록
    @PostMapping
    public ResponseEntity<ProductCreateResponse> create(
            @RequestBody ProductCreateRequest request,
            @RequestHeader("Authorization") String token) {

        // "Bearer " 문자열 제거 후 ID 추출
        String jwt = token.substring(7);
        Long companyId = jwtProvider.extractCompanyId(jwt);

        return ResponseEntity.ok(productService.createProduct(request, companyId));
    }

    // 제품 수정
    @PutMapping("/{id}")
    public ResponseEntity<ProductCreateResponse> update(
            @PathVariable Long id,
            @RequestBody ProductUpdateRequest request,
            @RequestParam Long companyId) {

        return ResponseEntity.ok(productService.updateProduct(id, request, companyId));
    }

    // 전 제품 불러오기
    @GetMapping
    public ResponseEntity<List<ProductCreateResponse>>getAll(@RequestParam Long companyId){
        return ResponseEntity.ok(productService.getAllProductsByCompany(companyId));
    }
}