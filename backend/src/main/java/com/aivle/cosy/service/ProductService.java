package com.aivle.cosy.service;

import com.aivle.cosy.domain.Company;
import com.aivle.cosy.domain.Product;
import com.aivle.cosy.dto.ProductRequest;
import com.aivle.cosy.dto.ProductResponse;
import com.aivle.cosy.exception.BusinessException;
import com.aivle.cosy.exception.ProductErrorCode;
import com.aivle.cosy.exception.SignUpErrorCode;
import com.aivle.cosy.repository.CompanyRepository;
import com.aivle.cosy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;

    public List<ProductResponse.DetailResponse> getProducts(Long companyId) {
        return productRepository.findByCompanyId(companyId)
                .stream()
                .map(ProductResponse.DetailResponse::from)
                .toList();
    }

    public ProductResponse.CreateResponse createProduct(Long companyId, ProductRequest.SaveRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException(SignUpErrorCode.COMPANY_NOT_FOUND));

        Product product = Product.builder()
                .company(company)
                .name(request.getName())
                .type(request.getType())
                .image(request.getImage())
                .fullIngredient(request.getFullIngredient())
                .status(request.getStatus())
                .build();

        Product savedProduct = productRepository.save(product);
        return new ProductResponse.CreateResponse(savedProduct.getId(), "제품이 성공적으로 등록되었습니다.");
    }

    public ProductResponse.MessageResponse updateProduct(Long id, Long companyId, ProductRequest.SaveRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // 사용자의 회사 ID와 제품의 회사 ID 검증
        if (!product.getCompany().getId().equals(companyId)) {
            throw new BusinessException(ProductErrorCode.UNAUTHORIZED_ACCESS);
        }

        // 엔티티 내 update 메서드 호출
        product.update(
                request.getName(),
                request.getType().name(),
                request.getImage(),
                request.getFullIngredient(),
                request.getStatus()
        );

        return new ProductResponse.MessageResponse("제품 정보가 성공적으로 수정되었습니다.");
    }

    // 하나만 삭제
    public ProductResponse.MessageResponse deleteProduct(Long id, Long companyId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND));

        if (!product.getCompany().getId().equals(companyId)) {
            throw new BusinessException(ProductErrorCode.UNAUTHORIZED_ACCESS);
        }

        productRepository.delete(product);
        return new ProductResponse.MessageResponse("제품이 삭제되었습니다.");
    }

    // 여러 삭제
    public ProductResponse.MessageResponse deleteMultipleProducts(List<Long> ids, Long companyId) {
        List<Product> products = productRepository.findAllById(ids);

        for (Product p : products) {
            if (!p.getCompany().getId().equals(companyId)) {
                throw new BusinessException(ProductErrorCode.UNAUTHORIZED_ACCESS);
            }
        }

        productRepository.deleteAllInBatch(products); // 대량 삭제 최적화 메서드
        return new ProductResponse.MessageResponse(ids.size() + "개의 제품이 삭제되었습니다.");
    }
}
