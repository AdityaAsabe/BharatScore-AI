package com.bharatscore.backend.dto;

public class ApplicantResponse {

    private Long id;
    private String name;
    private String city;
    private String occupation;
    private Double loanAmount;
    private Double incomeMonthly;
private String purpose;

    public ApplicantResponse() {
    }

    public ApplicantResponse(
        Long id,
        String name,
        String city,
        String occupation,
        Double loanAmount,
        Double incomeMonthly,
        String purpose) {

    this.id = id;
    this.name = name;
    this.city = city;
    this.occupation = occupation;
    this.loanAmount = loanAmount;
    this.incomeMonthly = incomeMonthly;
    this.purpose = purpose;
}

    public ApplicantResponse(
            Long id,
            String name,
            String city,
            String occupation,
            Double loanAmount) {

        this.id = id;
        this.name = name;
        this.city = city;
        this.occupation = occupation;
        this.loanAmount = loanAmount;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCity() {
        return city;
    }

    public String getOccupation() {
        return occupation;
    }

    public Double getLoanAmount() {
        return loanAmount;
    }

    public Double getIncomeMonthly() {
    return incomeMonthly;
}

public String getPurpose() {
    return purpose;
}

}