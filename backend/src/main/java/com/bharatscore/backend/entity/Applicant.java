package com.bharatscore.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "applicants")
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String occupation;

    @Column(nullable = false)
    private Double loanAmount;

    @Column(nullable = false)
    private Double incomeMonthly;

    @Column(nullable = false)
    private String purpose;

    public Applicant() {
    }

    public Applicant(String name, String city, String occupation, Double loanAmount) {
        this.name = name;
        this.city = city;
        this.occupation = occupation;
        this.loanAmount = loanAmount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getOccupation() {
        return occupation;
    }

    public void setOccupation(String occupation) {
        this.occupation = occupation;
    }

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Double getIncomeMonthly() {
    return incomeMonthly;
}

public void setIncomeMonthly(Double incomeMonthly) {
    this.incomeMonthly = incomeMonthly;
}

public String getPurpose() {
    return purpose;
}

public void setPurpose(String purpose) {
    this.purpose = purpose;
}

}