package com.aivle.cosy.dto;

import com.aivle.cosy.domain.Product;
import com.aivle.cosy.domain.Product.ProductType;
import com.aivle.cosy.domain.Product.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class ProductResponse {
    // 제품 생성 Response
    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateResponse{
        private Long id;
        private String message;
    }

    // 전 제품 조회 Response
    @Getter
    @Builder
    public static class DetailResponse{
        private Long id;
        private String name;
        private ProductType type;
        private String image;
        private String fullIngredient;
        private Status status;
        private LocalDateTime regDate;
        private LocalDateTime upDate;

        public static DetailResponse from(Product product) {
            return DetailResponse.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .type(product.getType())
                    .image(product.getImage())
                    .fullIngredient(product.getFullIngredient())
                    .status(product.getStatus())
                    .regDate(product.getRegDate())
                    .upDate(product.getUpdDate())
                    .build();
        }
    }

    // 제품 수정, 삭제 Response
    @Getter
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }

}
