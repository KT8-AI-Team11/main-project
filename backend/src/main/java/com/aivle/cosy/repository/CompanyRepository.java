package com.aivle.cosy.repository;

import com.aivle.cosy.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanyRepository extends JpaRepository<Company, Long> {
}
