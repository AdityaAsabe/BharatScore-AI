package com.bharatscore.backend.service;

import com.bharatscore.backend.dto.ExplanationResponse;
import com.bharatscore.backend.entity.AlternativeData;
import com.bharatscore.backend.entity.Assessment;
import com.bharatscore.backend.repository.AlternativeDataRepository;
import com.bharatscore.backend.repository.AssessmentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AlternativeDataRepository alternativeDataRepository;
    private final ExplanationService explanationService;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AlternativeDataRepository alternativeDataRepository,
            ExplanationService explanationService) {

        this.assessmentRepository = assessmentRepository;
        this.alternativeDataRepository = alternativeDataRepository;
        this.explanationService = explanationService;
    }

    public Assessment calculateScore(Long applicantId) {

        AlternativeData data =
                alternativeDataRepository.findByApplicantId(applicantId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Alternative data not found for applicant"));

        // --------------------------------------------------
        // Read all 6 BharatScore factors
        // --------------------------------------------------

        int transactionScore =
                safeValue(data.getTransactionConsistencyScore());

        int utilityScore =
                safeValue(data.getUtilityPaymentScore());

        int employmentScore =
                safeValue(data.getEmploymentStabilityScore());

        int rechargeScore =
                safeValue(data.getRechargeConsistencyScore());

        int marketScore =
                safeValue(data.getMarketRecordScore());

        int stabilityScore =
                safeValue(data.getStabilityScore());

        // --------------------------------------------------
        // Calculate BharatScore
        // --------------------------------------------------

        int creditScore = calculateCreditScore(
                transactionScore,
                utilityScore,
                employmentScore,
                rechargeScore,
                marketScore,
                stabilityScore
        );

        // --------------------------------------------------
        // Risk and lending decision
        // --------------------------------------------------

        String riskLevel =
                calculateRiskLevel(creditScore);

        String recommendation =
                calculateRecommendation(creditScore);

        int limitInr =
                calculateLimit(creditScore);

        int tenureMonths =
                calculateTenure(creditScore);

        // --------------------------------------------------
        // Confidence
        // --------------------------------------------------

        double confidence = calculateConfidence(
                transactionScore,
                utilityScore,
                employmentScore,
                rechargeScore,
                marketScore,
                stabilityScore
        );

        // --------------------------------------------------
        // Create or update assessment
        // --------------------------------------------------

        Assessment assessment =
                assessmentRepository
                        .findByApplicantId(applicantId)
                        .orElse(new Assessment());

        assessment.setApplicantId(applicantId);
        assessment.setCreditScore(creditScore);
        assessment.setRiskLevel(riskLevel);
        assessment.setRecommendation(recommendation);
        assessment.setLimitInr(limitInr);
        assessment.setTenureMonths(tenureMonths);
        assessment.setConfidence(confidence);

        // --------------------------------------------------
        // Store all 6 factors
        // --------------------------------------------------

        assessment.setFactorsJson(
                createFactorsJson(
                        transactionScore,
                        utilityScore,
                        employmentScore,
                        rechargeScore,
                        marketScore,
                        stabilityScore
                )
        );

        assessment.setModelVersion("v1.0");
        assessment.setGeneratedAt(LocalDateTime.now());

        return assessmentRepository.save(assessment);
    }

    // ------------------------------------------------------
    // Explanation
    // ------------------------------------------------------

    public Optional<ExplanationResponse> generateExplanation(
            Long assessmentId,
            String language) {

        return explanationService.generateExplanation(
                assessmentId,
                language
        );
    }

    // ------------------------------------------------------
    // BharatScore calculation
    // ------------------------------------------------------

    private int calculateCreditScore(
            int transactionScore,
            int utilityScore,
            int employmentScore,
            int rechargeScore,
            int marketScore,
            int stabilityScore) {

        /*
         * BharatScore weights
         *
         * UPI          = 30%
         * Bills        = 25%
         * Income       = 20%
         * Recharge     = 10%
         * Market       = 10%
         * Stability    = 5%
         *
         * Total        = 100%
         */

        double weightedScore =
                (transactionScore * 0.30) +
                (utilityScore * 0.25) +
                (employmentScore * 0.20) +
                (rechargeScore * 0.10) +
                (marketScore * 0.10) +
                (stabilityScore * 0.05);

        return (int) Math.round(
                300 + (6 * weightedScore)
        );
    }

    // ------------------------------------------------------
    // Risk level
    // ------------------------------------------------------

    private String calculateRiskLevel(int creditScore) {

        if (creditScore >= 750) {
            return "LOW";
        }

        if (creditScore >= 600) {
            return "MEDIUM";
        }

        return "HIGH";
    }

    // ------------------------------------------------------
    // Recommendation
    // ------------------------------------------------------

    private String calculateRecommendation(int creditScore) {

        if (creditScore >= 750) {
            return "APPROVE";
        }

        if (creditScore >= 600) {
            return "APPROVE_WITH_CONDITIONS";
        }

        return "REJECT_WITH_ROADMAP";
    }

    // ------------------------------------------------------
    // Loan limit
    // ------------------------------------------------------

    private int calculateLimit(int creditScore) {

        if (creditScore >= 750) {
            return 50000;
        }

        if (creditScore >= 600) {
            return 25000;
        }

        return 0;
    }

    // ------------------------------------------------------
    // Loan tenure
    // ------------------------------------------------------

    private int calculateTenure(int creditScore) {

        if (creditScore >= 750) {
            return 12;
        }

        if (creditScore >= 600) {
            return 6;
        }

        return 0;
    }

    // ------------------------------------------------------
    // Confidence
    // ------------------------------------------------------

    private double calculateConfidence(
            int transactionScore,
            int utilityScore,
            int employmentScore,
            int rechargeScore,
            int marketScore,
            int stabilityScore) {

        double average =
                (transactionScore
                + utilityScore
                + employmentScore
                + rechargeScore
                + marketScore
                + stabilityScore) / 6.0;

        /*
         * Store confidence as 0.00 - 1.00
         *
         * Example:
         * average = 84
         * confidence = 0.84
         */

        return Math.round(average) / 100.0;
    }

    // ------------------------------------------------------
    // Factor JSON
    // ------------------------------------------------------

    private String createFactorsJson(
            int transactionScore,
            int utilityScore,
            int employmentScore,
            int rechargeScore,
            int marketScore,
            int stabilityScore) {

        return String.format(
                "{\"upi\":%d,\"bills\":%d,\"income\":%d,\"recharge\":%d,\"market\":%d,\"stability\":%d}",
                transactionScore,
                utilityScore,
                employmentScore,
                rechargeScore,
                marketScore,
                stabilityScore
        );
    }

    // ------------------------------------------------------
    // Null-safe value
    // ------------------------------------------------------

    private int safeValue(Integer value) {
        return value == null ? 0 : value;
    }

    // ------------------------------------------------------
    // Get all assessments
    // ------------------------------------------------------

    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    // ------------------------------------------------------
    // Get assessment by ID
    // ------------------------------------------------------

    public Optional<Assessment> getAssessmentById(Long id) {
        return assessmentRepository.findById(id);
    }

    // ------------------------------------------------------
    // Get assessment by applicant
    // ------------------------------------------------------

    public Optional<Assessment> getAssessmentByApplicantId(
            Long applicantId) {

        return assessmentRepository.findByApplicantId(applicantId);
    }

    // ------------------------------------------------------
    // Delete assessment
    // ------------------------------------------------------

    public void deleteAssessment(Long id) {

        if (!assessmentRepository.existsById(id)) {
            throw new RuntimeException(
                    "Assessment not found");
        }

        assessmentRepository.deleteById(id);
    }
}