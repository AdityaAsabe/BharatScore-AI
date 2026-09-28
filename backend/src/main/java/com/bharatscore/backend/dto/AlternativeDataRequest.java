package com.bharatscore.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AlternativeDataRequest {

    @NotNull(message = "Applicant ID is required")
    private Long applicantId;

    @NotNull(message = "Utility payment score is required")
    @Min(0)
    @Max(100)
    private Integer utilityPaymentScore;

    @NotNull(message = "Digital activity score is required")
    @Min(0)
    @Max(100)
    private Integer digitalActivityScore;

    @NotNull(message = "Transaction consistency score is required")
    @Min(0)
    @Max(100)
    private Integer transactionConsistencyScore;

    @NotNull(message = "Employment stability score is required")
    @Min(0)
    @Max(100)
    private Integer employmentStabilityScore;

    public AlternativeDataRequest() {
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public void setApplicantId(Long applicantId) {
        this.applicantId = applicantId;
    }

    public Integer getUtilityPaymentScore() {
        return utilityPaymentScore;
    }

    public void setUtilityPaymentScore(Integer utilityPaymentScore) {
        this.utilityPaymentScore = utilityPaymentScore;
    }

    public Integer getDigitalActivityScore() {
        return digitalActivityScore;
    }

    public void setDigitalActivityScore(Integer digitalActivityScore) {
        this.digitalActivityScore = digitalActivityScore;
    }

    public Integer getTransactionConsistencyScore() {
        return transactionConsistencyScore;
    }

    public void setTransactionConsistencyScore(Integer transactionConsistencyScore) {
        this.transactionConsistencyScore = transactionConsistencyScore;
    }

    public Integer getEmploymentStabilityScore() {
        return employmentStabilityScore;
    }

    public void setEmploymentStabilityScore(Integer employmentStabilityScore) {
        this.employmentStabilityScore = employmentStabilityScore;
    }
}