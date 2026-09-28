package com.bharatscore.backend.service;

import com.bharatscore.backend.entity.Applicant;
import com.bharatscore.backend.repository.ApplicantRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ApplicantService {

    private final ApplicantRepository applicantRepository;

    public ApplicantService(ApplicantRepository applicantRepository) {
        this.applicantRepository = applicantRepository;
    }

    public Applicant createApplicant(Applicant applicant) {
        return applicantRepository.save(applicant);
    }

    public List<Applicant> getAllApplicants() {
        return applicantRepository.findAll();
    }

    public Optional<Applicant> getApplicantById(Long id) {
        return applicantRepository.findById(id);
    }

    public Applicant updateApplicant(Long id, Applicant updatedApplicant) {

        Applicant existingApplicant = applicantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        existingApplicant.setName(updatedApplicant.getName());
        existingApplicant.setCity(updatedApplicant.getCity());
        existingApplicant.setOccupation(updatedApplicant.getOccupation());
        existingApplicant.setLoanAmount(updatedApplicant.getLoanAmount());
        existingApplicant.setIncomeMonthly(updatedApplicant.getIncomeMonthly());
existingApplicant.setPurpose(updatedApplicant.getPurpose());

        return applicantRepository.save(existingApplicant);
    }

    public void deleteApplicant(Long id) {

        if (!applicantRepository.existsById(id)) {
            throw new RuntimeException("Applicant not found");
        }

        applicantRepository.deleteById(id);
    }
}