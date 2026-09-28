package com.bharatscore.backend.controller;

import com.bharatscore.backend.entity.Consent;
import com.bharatscore.backend.service.ConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/consents")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @PostMapping
    public ResponseEntity<Consent> createConsent(
            @RequestBody Consent consent
    ) {
        Consent savedConsent = consentService.createConsent(consent);
        return ResponseEntity.ok(savedConsent);
    }

    @GetMapping("/{applicantId}")
    public ResponseEntity<Consent> getConsentByApplicantId(
            @PathVariable Long applicantId
    ) {
        Optional<Consent> consent =
                consentService.getConsentByApplicantId(applicantId);

        return consent
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}