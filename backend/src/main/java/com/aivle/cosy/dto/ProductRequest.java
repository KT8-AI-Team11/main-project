package com.aivle.cosy.dto;

import com.aivle.cosy.domain.Product;
import com.aivle.cosy.domain.Product.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ProductRequest {
    // 제품 생성, 수정 Request
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaveRequest {
        private String name;
        private Product.ProductType type;
        private String fullIngredient;
        private Status status;
    }

}
