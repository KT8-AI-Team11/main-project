package com.aivle.cosy.service;

import com.aivle.cosy.domain.Company;
import com.aivle.cosy.domain.Product;
import com.aivle.cosy.dto.ProductCreateRequest;
import com.aivle.cosy.dto.ProductCreateResponse;
import com.aivle.cosy.dto.ProductUpdateRequest;
import com.aivle.cosy.repository.CompanyRepository;
import com.aivle.cosy.repository.ProductRepository;
//import jakarta.transaction.Transactional;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ProductCreateResponse createProduct(ProductCreateRequest request, Long companyId) {
        // 회사 존재 여부 조회
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 회사가 존재하지 않습니다."));

        // 빌더를 사용하여 연관관계인 Company까지 포함하여 생성
        Product product = Product.builder()
                .name(request.getName())
                .type(request.getType())
                .image(request.getImage())
                .fullIngredient(request.getFullIngredient())
                .status(request.getStatus())
                .company(company)
                .build();

        return ProductCreateResponse.from(productRepository.save(product));
    }

    @Transactional
    public ProductCreateResponse updateProduct(Long productId, ProductUpdateRequest request, Long companyId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품이 존재하지 않습니다."));

        // 요청자의 회사와 상품의 주인이 일치하는지 확인
        if (!product.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("해당 상품을 수정할 권한이 없습니다.");
        }

        product.update(
                request.getName(),
                request.getType(),
                request.getImage(),
                request.getFullIngredient(),
                product.getStatus()
        );

        return ProductCreateResponse.from(product);
    }

    // 전 제품 확인
    @Transactional(readOnly = true)
    public List<ProductCreateResponse> getAllProductsByCompany(Long companyId) {
        return productRepository.findByCompanyId(companyId).stream()
                .map(ProductCreateResponse::from)
                .collect(Collectors.toList());
    }
}
