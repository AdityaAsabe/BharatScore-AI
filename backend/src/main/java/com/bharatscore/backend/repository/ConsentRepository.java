package com.bharatscore.backend.repository;

import com.bharatscore.backend.entity.Consent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsentRepository extends JpaRepository<Consent, Long> {

    Optional<Consent> findByApplicantId(Long applicantId);

    Optional<Consent> findByConsentId(String consentId);
}