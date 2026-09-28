package com.bharatscore.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "alternative_data")
public class AlternativeData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long applicantId;

    private Integer utilityPaymentScore;

    private Integer digitalActivityScore;

    private Integer transactionConsistencyScore;

    private Integer employmentStabilityScore;

    // New fields
    private Integer rechargeConsistencyScore;

    private Integer marketRecordScore;

    private Integer stabilityScore;

    public AlternativeData() {
    }

    public AlternativeData(
            Long applicantId,
            Integer utilityPaymentScore,
            Integer digitalActivityScore,
            Integer transactionConsistencyScore,
            Integer employmentStabilityScore,
            Integer rechargeConsistencyScore,
            Integer marketRecordScore,
            Integer stabilityScore
    ) {
        this.applicantId = applicantId;
        this.utilityPaymentScore = utilityPaymentScore;
        this.digitalActivityScore = digitalActivityScore;
        this.transactionConsistencyScore = transactionConsistencyScore;
        this.employmentStabilityScore = employmentStabilityScore;
        this.rechargeConsistencyScore = rechargeConsistencyScore;
        this.marketRecordScore = marketRecordScore;
        this.stabilityScore = stabilityScore;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Integer getRechargeConsistencyScore() {
        return rechargeConsistencyScore;
    }

    public void setRechargeConsistencyScore(Integer rechargeConsistencyScore) {
        this.rechargeConsistencyScore = rechargeConsistencyScore;
    }

    public Integer getMarketRecordScore() {
        return marketRecordScore;
    }

    public void setMarketRecordScore(Integer marketRecordScore) {
        this.marketRecordScore = marketRecordScore;
    }

    public Integer getStabilityScore() {
        return stabilityScore;
    }

    public void setStabilityScore(Integer stabilityScore) {
        this.stabilityScore = stabilityScore;
    }
}