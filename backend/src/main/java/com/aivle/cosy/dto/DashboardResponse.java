package com.aivle.cosy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {
    private long productCount;
    private long recentChecks;
    private long ingredientCount;
    private long marketingCount;
}
