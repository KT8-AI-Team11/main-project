package com.aivle.cosy.dto;

import com.aivle.cosy.domain.Log;
import lombok.Getter;
import java.time.LocalDateTime;

@Getter
public class LogResponse {
    private Long logId;
    private String country;
    private Long productId;
    private String productName;

    private String ingredientStatus;
    private String cautiousIngredient;
    private String ingredientLaw;

    private String marketingStatus;
    private String marketingLaw;

    private LocalDateTime updDate;

    public LogResponse(Log log) {
        this.logId = log.getLogId();
        this.country = log.getCountry().name();
        this.productId = log.getProduct().getId();
        this.productName = log.getProduct().getName();

        this.ingredientStatus = log.getIngredientStatus() != null ? log.getIngredientStatus().name() : "UNKNOWN";
        this.cautiousIngredient = log.getCautiousIngredient();
        this.ingredientLaw = log.getIngredientLaw();

        this.marketingStatus = log.getMarketingStatus() != null ? log.getMarketingStatus().name() : "UNKNOWN";
        this.marketingLaw = log.getMarketingLaw();

        this.updDate = log.getUpdDate();
    }
}