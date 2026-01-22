package com.aivle.cosy.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "Product")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    // 외래키
    private Company company;

    @Column(nullable = false,length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    private ProductType type;

    private String image;

    @Column(columnDefinition = "TEXT")
    private String fullIngredient;

    @Enumerated(EnumType.STRING)
    private Status status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime regDate;

    @UpdateTimestamp
    private LocalDateTime updDate;

    public enum ProductType{
        SKINCARE, MAKEUP, SUNSCREEN, BODYCARE
    }

    public enum Status{
        STEP_1, STEP_2, STEP_3, STEP_4, STEP_5
    }

//    Setter을 사용하지 않을 때 로직(id 때문)
//    @Builder
//    public Product(Company company, String name, ProductType type, String image, String fullIngredient, Status status) {
//        this.company = company;
//        this.name = name;
//        this.type = type;
//        this.image = image;
//        this.fullIngredient = fullIngredient;
//        this.status = status;
//    }
//
//    // Setter 대신
//    public void updateStatus(Status newStatus) {
//        this.status = newStatus;
//    }
}
