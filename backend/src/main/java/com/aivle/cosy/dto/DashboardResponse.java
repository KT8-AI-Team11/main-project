package com.aivle.cosy.dto;

import lombok.Data;

public class DashboardReponse {
    private long productCount;
    private long recentChecks;
    private long warningCount;
    
    public DashboardReponse(long productCount, long recentChecks, long warningCount){
        this.productCount = productCount;
        this.recentChecks = recentChecks;
        this.warningCount = warningCount;
    }
}
