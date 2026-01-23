package com.aivle.cosy.dto;

import com.aivle.cosy.domain.Product;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductCreateResponse {
    private Long id;
    private String name;
    private String type;
    private String image;
    private String fullIngredient;
    private String status;

    private LocalDateTime regDate;
    private LocalDateTime updDate;

    public static ProductCreateResponse from(Product product) {
        return ProductCreateResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .type(product.getType().name())
                .image(product.getImage())
                .fullIngredient(product.getFullIngredient())
                .status(product.getStatus().name())
                .regDate(product.getRegDate())
                .updDate(product.getUpdDate())
                .build();
    }
}