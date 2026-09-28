package com.bharatscore.backend.dto;

public class ScoreResponse {

    private Long applicantId;
    private Integer creditScore;
    private String riskLevel;
    private String recommendation;

    public ScoreResponse() {
    }

    public ScoreResponse(
            Long applicantId,
            Integer creditScore,
            String riskLevel,
            String recommendation) {

        this.applicantId = applicantId;
        this.creditScore = creditScore;
        this.riskLevel = riskLevel;
        this.recommendation = recommendation;
    }

    public Long getApplicantId() {
        return applicantId;
    }

    public Integer getCreditScore() {
        return creditScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public String getRecommendation() {
        return recommendation;
    }
}