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
    private String approvalStatus;
    private String cautiousIngredient;
    private String ingredientLaw;
    private String marketingLaw;
    private LocalDateTime updDate;

    public LogResponse(Log log) {
        this.logId = log.getLogId();
        this.country = log.getCountry().name();
        this.productId = log.getProduct().getId();
        this.productName = log.getProduct().getName();
        this.approvalStatus = log.getApprovalStatus() != null ? log.getApprovalStatus().name() : "UNKNOWN";
        this.cautiousIngredient = log.getCautiousIngredient();
        this.ingredientLaw = log.getIngredientLaw();
        this.marketingLaw = log.getMarketingLaw();
        this.updDate = log.getUpdDate();
    }
}