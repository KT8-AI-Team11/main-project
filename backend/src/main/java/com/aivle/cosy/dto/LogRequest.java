package com.aivle.cosy.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class LogRequest {
    private Long productId;
    private String country;

    // 업데이트 구분 (ingredient/marketing)
    private String updateType;

    private String ingredientStatus;
    private String cautiousIngredient;
    private String ingredientLaw;

    private String marketingStatus;
    private String marketingLaw;
}
