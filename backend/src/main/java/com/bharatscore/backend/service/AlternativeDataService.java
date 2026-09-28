package com.bharatscore.backend.service;

import com.bharatscore.backend.entity.AlternativeData;
import com.bharatscore.backend.repository.AlternativeDataRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AlternativeDataService {

    private final AlternativeDataRepository alternativeDataRepository;

    public AlternativeDataService(
            AlternativeDataRepository alternativeDataRepository) {

        this.alternativeDataRepository = alternativeDataRepository;
    }

    public AlternativeData createAlternativeData(
            AlternativeData alternativeData) {

        return alternativeDataRepository.save(alternativeData);
    }

    public List<AlternativeData> getAllAlternativeData() {

        return alternativeDataRepository.findAll();
    }

    public Optional<AlternativeData> getAlternativeDataById(Long id) {

        return alternativeDataRepository.findById(id);
    }

    public Optional<AlternativeData> getAlternativeDataByApplicantId(
            Long applicantId) {

        return alternativeDataRepository.findByApplicantId(applicantId);
    }

    public AlternativeData updateAlternativeData(
            Long id,
            AlternativeData updatedData) {

        AlternativeData existingData =
                alternativeDataRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Alternative data not found"));

        existingData.setApplicantId(updatedData.getApplicantId());
        existingData.setUtilityPaymentScore(
                updatedData.getUtilityPaymentScore());
        existingData.setDigitalActivityScore(
                updatedData.getDigitalActivityScore());
        existingData.setTransactionConsistencyScore(
                updatedData.getTransactionConsistencyScore());
        existingData.setEmploymentStabilityScore(
                updatedData.getEmploymentStabilityScore());
        existingData.setRechargeConsistencyScore(
        updatedData.getRechargeConsistencyScore());

existingData.setMarketRecordScore(
        updatedData.getMarketRecordScore());

existingData.setStabilityScore(
        updatedData.getStabilityScore());

        return alternativeDataRepository.save(existingData);
    }

    public void deleteAlternativeData(Long id) {

        if (!alternativeDataRepository.existsById(id)) {
            throw new RuntimeException(
                    "Alternative data not found");
        }

        alternativeDataRepository.deleteById(id);
    }
}