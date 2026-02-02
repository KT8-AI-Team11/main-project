package com.aivle.cosy.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LogRequest {
    private Long productId;
    private String country;
    private String approvalStatus;
    private String cautiousIngredient;
    private String ingredientLaw;
    private String marketingLaw;
}
