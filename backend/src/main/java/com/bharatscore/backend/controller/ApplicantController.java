package com.bharatscore.backend.controller;

import com.bharatscore.backend.entity.Applicant;
import com.bharatscore.backend.service.ApplicantService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applicants")
public class ApplicantController {

    private final ApplicantService applicantService;

    public ApplicantController(ApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    @PostMapping
    public ResponseEntity<Applicant> createApplicant(
            @RequestBody Applicant applicant) {

        Applicant savedApplicant =
                applicantService.createApplicant(applicant);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedApplicant);
    }

    @GetMapping
    public ResponseEntity<List<Applicant>> getAllApplicants() {

        return ResponseEntity.ok(
                applicantService.getAllApplicants()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Applicant> getApplicantById(
            @PathVariable Long id) {

        return applicantService.getApplicantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Applicant> updateApplicant(
            @PathVariable Long id,
            @RequestBody Applicant applicant) {

        return ResponseEntity.ok(
                applicantService.updateApplicant(id, applicant)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplicant(
            @PathVariable Long id) {

        applicantService.deleteApplicant(id);

        return ResponseEntity.noContent().build();
    }
}