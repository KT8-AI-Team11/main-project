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
import com.aivle.cosy.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {
    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;
    private final S3Service s3Service;

    public List<ProductResponse.DetailResponse> getProducts(Long companyId) {
        return productRepository.findByCompanyId(companyId)
                .stream()
                .map(ProductResponse.DetailResponse::from)
                .toList();
    }

    public ProductResponse.CreateResponse createProduct(Long companyId, ProductRequest.SaveRequest request, MultipartFile imageFile) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException(SignUpErrorCode.COMPANY_NOT_FOUND));

        String imageUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = s3Service.uploadFile(imageFile, "products/" + companyId);
        }

        Product product = Product.builder()
                .company(company)
                .name(request.getName())
                .type(request.getType())
                .image(imageUrl)
                .fullIngredient(request.getFullIngredient())
                .status(request.getStatus())
                .build();

        Product savedProduct = productRepository.save(product);
        return new ProductResponse.CreateResponse(savedProduct.getId(), "제품이 성공적으로 등록되었습니다.");
    }

    public ProductResponse.MessageResponse updateProduct(Long id, Long companyId, ProductRequest.SaveRequest request, MultipartFile imageFile) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND));

        // 사용자의 회사 ID와 제품의 회사 ID 검증
        if (!product.getCompany().getId().equals(companyId)) {
            throw new BusinessException(ProductErrorCode.UNAUTHORIZED_ACCESS);
        }

        String imageUrl = product.getImage();
        if (imageFile != null && !imageFile.isEmpty()) {
            s3Service.deleteFileByUrl(imageUrl);
            imageUrl = s3Service.uploadFile(imageFile, "products/" + companyId);
            // (선택) 기존 이미지 S3 삭제까지 하고 싶으면 여기서 처리
        }

        // 엔티티 내 update 메서드 호출
        product.update(
                request.getName(),
                request.getType().name(),
                imageUrl,
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

        String imageUrl = product.getImage();
        if (imageUrl != null || imageUrl.isEmpty()) {
            s3Service.deleteFileByUrl(imageUrl);
        }

        productRepository.delete(product);
        return new ProductResponse.MessageResponse("제품이 삭제되었습니다.");
    }

    // 여러 삭제
    public ProductResponse.MessageResponse deleteMultipleProducts(List<Long> ids, Long companyId) {
        List<Product> products = productRepository.findAllById(ids);

        // 요청한 개수와 찾은 개수가 다르면 예외 처리 (선택 사항)
        if (products.size() != ids.size()) {
            throw new BusinessException(ProductErrorCode.PRODUCT_NOT_FOUND);
        }

        for (Product p : products) {
            if (!p.getCompany().getId().equals(companyId)) {
                throw new BusinessException(ProductErrorCode.UNAUTHORIZED_ACCESS);
            }
            String imageUrl = p.getImage();
            if (imageUrl != null || imageUrl.isEmpty()) {
                s3Service.deleteFileByUrl(imageUrl);
            }
        }

        productRepository.deleteAllInBatch(products);
        return new ProductResponse.MessageResponse(products.size() + "개의 제품이 삭제되었습니다.");
    }
}
