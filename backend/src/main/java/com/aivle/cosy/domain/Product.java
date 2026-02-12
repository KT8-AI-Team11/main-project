package com.aivle.cosy.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
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

    @Column(length = 2048)
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

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Log> logs = new ArrayList<>();

    public enum ProductType{
        SKINCARE, MAKEUP, SUNSCREEN, BODYCARE
    }

    public enum Status{
        STEP_1, STEP_2, STEP_3, STEP_4, STEP_5
    }

    @Builder
    public Product(Company company, String name, ProductType type, String image, String fullIngredient, Status status, LocalDateTime updDate) {
        this.company = company;
        this.name = name;
        this.type = type;
        this.image = image;
        this.fullIngredient = fullIngredient;
        this.status = status;
    }

    // Setter 대신
    public void update(String name, String type, String image, String fullIngredient, Status status) {
        this.name = name;
        this.type = ProductType.valueOf(type);
        this.image = image;
        this.fullIngredient = fullIngredient;
        this.status = status;
    }
}
