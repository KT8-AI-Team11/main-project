package com.aivle.cosy.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", length = 20)
    private ApprovalStatus approvalStatus;

    @Column(columnDefinition = "TEXT")
    private String cautiousIngredient;

    @Column(columnDefinition = "TEXT")
    private String ingredientLaw;

    @Column(columnDefinition = "TEXT")
    private String marketingLaw;

    @UpdateTimestamp
    private LocalDateTime updDate;

    public enum Country {
        US, JP, CN, EU
    }

    public enum ApprovalStatus {
        HIGH, MEDIUM, LOW
    }

    @Builder
    public Log(Country country, Product product, Company company, ApprovalStatus approvalStatus,
               String cautiousIngredient, String ingredientLaw, String marketingLaw) {
        this.country = country;
        this.product = product;
        this.company = company;
        this.approvalStatus = approvalStatus;
        this.cautiousIngredient = cautiousIngredient;
        this.ingredientLaw = ingredientLaw;
        this.marketingLaw = marketingLaw;
    }

    // update를 위한 메소드
    public void updateAnalysis(ApprovalStatus approvalStatus, String cautiousIngredient, String ingredientLaw, String marketingLaw){
        this.approvalStatus = approvalStatus;
        this.cautiousIngredient = cautiousIngredient;
        this.ingredientLaw = ingredientLaw;
        this.marketingLaw = marketingLaw;
    }

}
