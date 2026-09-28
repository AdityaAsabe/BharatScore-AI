package com.bharatscore.backend.controller;

import com.bharatscore.backend.entity.Assessment;
import com.bharatscore.backend.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.bharatscore.backend.dto.ExplanationResponse;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {

        this.assessmentService = assessmentService;
    }

    @PostMapping("/calculate/{applicantId}")
    public ResponseEntity<Assessment> calculateScore(
            @PathVariable Long applicantId) {

        Assessment assessment =
                assessmentService.calculateScore(applicantId);

        return ResponseEntity.ok(assessment);
    }

    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {

        return ResponseEntity.ok(
                assessmentService.getAllAssessments()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getAssessmentById(
            @PathVariable Long id) {

        return assessmentService
                .getAssessmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<Assessment> getAssessmentByApplicantId(
            @PathVariable Long applicantId) {

        return assessmentService
                .getAssessmentByApplicantId(applicantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssessment(
            @PathVariable Long id) {

        assessmentService.deleteAssessment(id);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/explanation")
public ResponseEntity<ExplanationResponse> getExplanation(
        @PathVariable Long id,
        @RequestParam(defaultValue = "en") String lang
) {
        System.out.println(">>> EXPLANATION ENDPOINT HIT <<<");
    return assessmentService
            .generateExplanation(id, lang)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

}