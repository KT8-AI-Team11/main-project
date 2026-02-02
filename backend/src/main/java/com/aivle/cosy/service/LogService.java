package com.aivle.cosy.service;

import com.aivle.cosy.domain.Log;
import com.aivle.cosy.domain.Product;
import com.aivle.cosy.dto.LogRequest;
import com.aivle.cosy.repository.LogRepository;
import com.aivle.cosy.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional
public class LogService {
    private final LogRepository logRepository;
    private final ProductRepository productRepository;

    public void upsertLog(Long companyId, LogRequest request) {
        // 국가를 Enum으로 변경
        Log.Country country = Log.Country.valueOf(request.getCountry().toUpperCase());

        // 기존 로그 조회
        logRepository.findByProductIdAndCountry(request.getProductId(), country)
                .ifPresentOrElse(
                        // 로그 update
                        existingLog -> {
                            existingLog.updateAnalysis(
                                    Log.ApprovalStatus.valueOf(request.getApprovalStatus()),
                                    request.getCautiousIngredient(),
                                    request.getIngredientLaw(),
                                    request.getMarketingLaw()
                            );
                        },
                        // 로그 create
                        () -> {
                            Product product = productRepository.findById(request.getProductId()).orElseThrow();
                            Log newLog = Log.builder()
                                    .company(product.getCompany())
                                    .product(product)
                                    .country(country)
                                    .approvalStatus(Log.ApprovalStatus.valueOf(request.getApprovalStatus()))
                                    .cautiousIngredient(request.getCautiousIngredient())
                                    .ingredientLaw(request.getIngredientLaw())
                                    .marketingLaw(request.getMarketingLaw())
                                    .build();
                            logRepository.save(newLog);
                        }
                );
    }

    public List<Log> getAllLogsByCompany(Long companyId){
        return logRepository.findByCompanyId(companyId);
    }

    public List<Log> getLogsByCountry(Long companyId, String country_name){
        Log.Country country = Log.Country.valueOf(country_name.toUpperCase());
        return logRepository.findByCompanyIdAndCountry(companyId, country);
    }

}
