package com.bharatscore.backend.repository;

import com.bharatscore.backend.entity.AlternativeData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlternativeDataRepository extends JpaRepository<AlternativeData, Long> {

    Optional<AlternativeData> findByApplicantId(Long applicantId);
}