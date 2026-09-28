package com.bharatscore.backend.service;

import com.bharatscore.backend.dto.ExplanationResponse;
import com.bharatscore.backend.entity.Assessment;
import com.bharatscore.backend.repository.AssessmentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExplanationService {

    private final AssessmentRepository assessmentRepository;

    public ExplanationService(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    public Optional<ExplanationResponse> generateExplanation(
            Long assessmentId,
            String language
    ) {

        Optional<Assessment> assessmentOptional =
                assessmentRepository.findById(assessmentId);

        if (assessmentOptional.isEmpty()) {
            return Optional.empty();
        }

        Assessment assessment = assessmentOptional.get();

        String lang = normalizeLanguage(language);

        List<String> factors = new ArrayList<>();

        String summary;
        String recommendation;

        // =========================
        // ENGLISH
        // =========================
        if ("en".equals(lang)) {

            summary = "Your BharatScore is "
                    + assessment.getCreditScore()
                    + " and your risk level is "
                    + assessment.getRiskLevel()
                    + ".";

            factors.add(
                    "Transaction consistency is an important factor in your score."
            );

            factors.add(
                    "Utility payment discipline reflects financial reliability."
            );

            factors.add(
                    "Employment stability indicates repayment capacity."
            );

            factors.add(
                    "Digital activity provides additional financial behaviour signals."
            );

            recommendation = "Recommendation: "
                    + assessment.getRecommendation();
        }

        // =========================
        // HINDI
        // =========================
        else if ("hi".equals(lang)) {

            summary = "आपका BharatScore "
                    + assessment.getCreditScore()
                    + " है और आपकी जोखिम श्रेणी "
                    + getHindiRiskLevel(assessment.getRiskLevel())
                    + " है।";

            factors.add(
                    "लेनदेन की निरंतरता आपके BharatScore का एक महत्वपूर्ण कारक है।"
            );

            factors.add(
                    "उपयोगिता बिलों का समय पर भुगतान आपकी वित्तीय विश्वसनीयता को दर्शाता है।"
            );

            factors.add(
                    "रोजगार की स्थिरता आपकी ऋण चुकाने की क्षमता का संकेत देती है।"
            );

            factors.add(
                    "डिजिटल गतिविधि आपके वित्तीय व्यवहार के अतिरिक्त संकेत प्रदान करती है।"
            );

            recommendation = "सिफारिश: "
                    + getHindiRecommendation(assessment.getRecommendation());
        }

        // =========================
        // MARATHI
        // =========================
        else {

            summary = "तुमचा BharatScore "
                    + assessment.getCreditScore()
                    + " आहे आणि तुमची जोखीम पातळी "
                    + getMarathiRiskLevel(assessment.getRiskLevel())
                    + " आहे.";

            factors.add(
                    "व्यवहारातील सातत्य हा तुमच्या BharatScore मधील एक महत्त्वाचा घटक आहे."
            );

            factors.add(
                    "युटिलिटी बिल वेळेवर भरणे तुमची आर्थिक विश्वासार्हता दर्शवते."
            );

            factors.add(
                    "रोजगारातील स्थिरता तुमची कर्ज परतफेड करण्याची क्षमता दर्शवते."
            );

            factors.add(
                    "डिजिटल गतिविधी तुमच्या आर्थिक वर्तनाबद्दल अतिरिक्त माहिती प्रदान करते."
            );

            recommendation = "शिफारस: "
                    + getMarathiRecommendation(assessment.getRecommendation());
        }

        return Optional.of(
                new ExplanationResponse(
                        assessment.getId(),
                        lang,
                        summary,
                        factors,
                        recommendation
                )
        );
    }

    // =========================
    // LANGUAGE NORMALIZATION
    // =========================

    private String normalizeLanguage(String language) {

        if (language == null) {
            return "en";
        }

        String lang = language.toLowerCase().trim();

        if ("hi".equals(lang)) {
            return "hi";
        }

        if ("mr".equals(lang)) {
            return "mr";
        }

        return "en";
    }

    // =========================
    // HINDI RISK LEVEL
    // =========================

    private String getHindiRiskLevel(String riskLevel) {

        if ("LOW".equalsIgnoreCase(riskLevel)) {
            return "कम";
        }

        if ("MEDIUM".equalsIgnoreCase(riskLevel)) {
            return "मध्यम";
        }

        return "उच्च";
    }

    // =========================
    // HINDI RECOMMENDATION
    // =========================

    private String getHindiRecommendation(String recommendation) {

        if ("APPROVE".equalsIgnoreCase(recommendation)) {
            return "स्वीकृत";
        }

        if ("APPROVE_WITH_CONDITIONS".equalsIgnoreCase(recommendation)) {
            return "शर्तों के साथ स्वीकृत";
        }

        if ("REJECT_WITH_ROADMAP".equalsIgnoreCase(recommendation)) {
            return "अस्वीकृत — सुधार योजना के साथ";
        }

        return recommendation;
    }

    // =========================
    // MARATHI RISK LEVEL
    // =========================

    private String getMarathiRiskLevel(String riskLevel) {

        if ("LOW".equalsIgnoreCase(riskLevel)) {
            return "कमी";
        }

        if ("MEDIUM".equalsIgnoreCase(riskLevel)) {
            return "मध्यम";
        }

        return "उच्च";
    }

    // =========================
    // MARATHI RECOMMENDATION
    // =========================

    private String getMarathiRecommendation(String recommendation) {

        if ("APPROVE".equalsIgnoreCase(recommendation)) {
            return "मंजूर";
        }

        if ("APPROVE_WITH_CONDITIONS".equalsIgnoreCase(recommendation)) {
            return "अटींसह मंजूर";
        }

        if ("REJECT_WITH_ROADMAP".equalsIgnoreCase(recommendation)) {
            return "नाकारले — सुधारणा योजनेसह";
        }

        return recommendation;
    }
}