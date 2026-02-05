package com.aivle.cosy.repository;

import com.aivle.cosy.domain.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    // 기록 조회 -> 이를 통해 Update를 할지 Insert를 할지 결정
    Optional<Log> findByProductIdAndCountry(Long productId, Log.Country country);

    // 회사의 특정 국가 기록 전체 조회 (국가별 리스트 페이지용)
    List<Log> findByCompanyIdAndCountry(Long companyId, Log.Country country);

    // 해당 회사의 전 로그 조회
    List<Log> findByCompanyId(Long companyId);

    // 최근 7일 이내 로그 개수
    long countByCompanyIdAndUpdDateAfter(Long companyId, LocalDateTime date);

    // 위험도 MEDIUM 또는 HIGH인 로그 개수
    long countByCompanyIdAndApprovalStatusIn(Long companyId, List<Log.ApprovalStatus> statuses);
}
