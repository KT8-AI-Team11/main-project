package com.aivle.cosy.dto;

import com.aivle.cosy.domain.Product.ProductType;
import com.aivle.cosy.domain.Product.Status;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductCreateRequest {
    private String name;
    private ProductType type;
    private String image;
    private String fullIngredient;
    private Status status;
}
