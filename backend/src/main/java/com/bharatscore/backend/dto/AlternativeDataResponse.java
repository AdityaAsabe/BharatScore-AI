package com.bharatscore.backend.dto;

public class AlternativeDataResponse {

    private Long id;
    private Long applicantId;
    private Integer utilityPaymentScore;
    private Integer digitalActivityScore;
    private Integer transactionConsistencyScore;
    private Integer employmentStabilityScore;

    public AlternativeDataResponse() {
    }

    public AlternativeDataResponse(
            Long id,
            Long applicantId,
            Integer utilityPaymentScore,
            Integer digitalActivityScore,
            Integer transactionConsistencyScore,
            Integer employmentStabilityScore) {

        this.id = id;
        this.applicantId = applicantId;
        this.utilityPaymentScore = utilityPaymentScore;
        this.digitalActivityScore = digitalActivityScore;
        this.transactionConsistencyScore = transactionConsistencyScore;
        this.employmentStabilityScore = employmentStabilityScore;
    }

    public Long getId() {
        return id;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public Integer getUtilityPaymentScore() {
        return utilityPaymentScore;
    }

    public Integer getDigitalActivityScore() {
        return digitalActivityScore;
    }

    public Integer getTransactionConsistencyScore() {
        return transactionConsistencyScore;
    }

    public Integer getEmploymentStabilityScore() {
        return employmentStabilityScore;
    }
}