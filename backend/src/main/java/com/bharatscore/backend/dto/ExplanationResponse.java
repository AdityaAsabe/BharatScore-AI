package com.bharatscore.backend.dto;

import java.util.List;

public class ExplanationResponse {

    private Long assessmentId;
    private String language;
    private String summary;
    private List<String> factors;
    private String recommendation;

    public ExplanationResponse() {
    }

    public ExplanationResponse(
            Long assessmentId,
            String language,
            String summary,
            List<String> factors,
            String recommendation
    ) {
        this.assessmentId = assessmentId;
        this.language = language;
        this.summary = summary;
        this.factors = factors;
        this.recommendation = recommendation;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public String getLanguage() {
        return language;
    }

    public String getSummary() {
        return summary;
    }

    public List<String> getFactors() {
        return factors;
    }

    public String getRecommendation() {
        return recommendation;
    }
}