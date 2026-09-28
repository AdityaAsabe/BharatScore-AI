package com.bharatscore.backend.controller;

import com.bharatscore.backend.entity.AlternativeData;
import com.bharatscore.backend.service.AlternativeDataService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alternative-data")
public class AlternativeDataController {

    private final AlternativeDataService alternativeDataService;

    public AlternativeDataController(
            AlternativeDataService alternativeDataService) {

        this.alternativeDataService = alternativeDataService;
    }

    @PostMapping
    public ResponseEntity<AlternativeData> createAlternativeData(
            @RequestBody AlternativeData alternativeData) {

        AlternativeData savedData =
                alternativeDataService.createAlternativeData(
                        alternativeData);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedData);
    }

    @GetMapping
    public ResponseEntity<List<AlternativeData>> getAllAlternativeData() {

        return ResponseEntity.ok(
                alternativeDataService.getAllAlternativeData()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlternativeData> getAlternativeDataById(
            @PathVariable Long id) {

        return alternativeDataService
                .getAlternativeDataById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/applicant/{applicantId}")
    public ResponseEntity<AlternativeData>
    getAlternativeDataByApplicantId(
            @PathVariable Long applicantId) {

        return alternativeDataService
                .getAlternativeDataByApplicantId(applicantId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlternativeData> updateAlternativeData(
            @PathVariable Long id,
            @RequestBody AlternativeData alternativeData) {

        return ResponseEntity.ok(
                alternativeDataService.updateAlternativeData(
                        id,
                        alternativeData)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlternativeData(
            @PathVariable Long id) {

        alternativeDataService.deleteAlternativeData(id);

        return ResponseEntity.noContent().build();
    }
}