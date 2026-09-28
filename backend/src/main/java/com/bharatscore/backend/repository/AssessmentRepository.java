package com.bharatscore.backend.repository;

import com.bharatscore.backend.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {

    Optional<Assessment> findByApplicantId(Long applicantId);
}