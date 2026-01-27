package com.aivle.cosy.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProductUpdateRequest {
    private String name;
    private String type;
    private String image;
    private String fullIngredient;
    private String status;
}
