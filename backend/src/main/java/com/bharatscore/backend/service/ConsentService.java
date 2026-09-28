package com.bharatscore.backend.service;

import com.bharatscore.backend.entity.Consent;
import com.bharatscore.backend.repository.ConsentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ConsentService {

    private final ConsentRepository consentRepository;

    public ConsentService(ConsentRepository consentRepository) {
        this.consentRepository = consentRepository;
    }

    public Consent createConsent(Consent consent) {

        consent.setGrantedAt(LocalDateTime.now());

        return consentRepository.save(consent);
    }

    public Optional<Consent> getConsentByApplicantId(Long applicantId) {

        return consentRepository.findByApplicantId(applicantId);
    }

    public Optional<Consent> getConsentByConsentId(String consentId) {

        return consentRepository.findByConsentId(consentId);
    }
}