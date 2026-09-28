package com.bharatscore.backend.repository;

import com.bharatscore.backend.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
}