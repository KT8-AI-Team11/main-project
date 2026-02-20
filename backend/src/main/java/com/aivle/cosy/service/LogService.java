package com.aivle.cosy.service;

import com.aivle.cosy.domain.Log;
import com.aivle.cosy.domain.Product;
import com.aivle.cosy.dto.LogRequest;
import com.aivle.cosy.repository.LogRepository;
import com.aivle.cosy.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class LogService {
    private final LogRepository logRepository;
    private final ProductRepository productRepository;

    // 성분(Ingredient) 탭 전용 조회
    public List<Log> getIngredientLogsByCompany(Long companyId) {
        return logRepository.findByCompanyId(companyId);
    }

    public List<Log> getIngredientLogsByCountry(Long companyId, String countryName) {
        Log.Country country = Log.Country.valueOf(countryName.toUpperCase());
        return logRepository.findByCompanyIdAndCountry(companyId, country); //
    }

    // 문구(Marketing) 탭 전용 조회
    public List<Log> getMarketingLogsByCompany(Long companyId) {
        return logRepository.findByCompanyId(companyId);
    }

    public List<Log> getMarketingLogsByCountry(Long companyId, String countryName) {
        Log.Country country = Log.Country.valueOf(countryName.toUpperCase());
        return logRepository.findByCompanyIdAndCountry(companyId, country);
    }

    public void upsertLog(Long companyId, LogRequest request) {
        Log.Country country = Log.Country.valueOf(request.getCountry().toUpperCase());

        Log log = logRepository.findByProductIdAndCountry(request.getProductId(), country)
                .orElseGet(
                        () -> {
                            Product product = productRepository.findById(request.getProductId()).orElseThrow();
                            return logRepository.save(Log.builder()
                                    .company(product.getCompany())
                                    .product(product)
                                    .country(country)
                                    .build());
                        });

        if ("INGREDIENT".equalsIgnoreCase(request.getUpdateType())) {
            log.updateIngredientAnalysis(
                    Log.ApprovalStatus.valueOf(request.getIngredientStatus()),
                    request.getCautiousIngredient(),
                    request.getIngredientLaw()
            );
        } else if ("MARKETING".equalsIgnoreCase(request.getUpdateType())) {
            log.updateMarketingAnalysis(
                    Log.ApprovalStatus.valueOf(request.getMarketingStatus()),
                    request.getMarketingLaw()
            );
        }
    }

}
