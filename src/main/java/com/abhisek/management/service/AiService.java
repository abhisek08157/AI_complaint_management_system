package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;

    public AiService(
            @Value("${ai.service.url:http://127.0.0.1:8000}")
            String aiServiceUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    // ============================================================
    // ANALYZE COMPLAINT
    // ============================================================

    public AiAnalysisResult analyzeComplaint(
            String title,
            String description) {

        try {

            Map<String, String> requestBody = Map.of(
                    "title", title,
                    "description", description
            );

            AiAnalysisResult response = restClient.post()
                    .uri("/api/v1/analyze/complaint")
                    .body(requestBody)
                    .retrieve()
                    .body(AiAnalysisResult.class);

            if (response == null) {

                System.err.println(
                        "AI service returned an empty response. "
                                + "Using fallback analysis."
                );

                return createFallbackAnalysis(
                        title,
                        description
                );
            }

            return normalizeResponse(
                    response,
                    title,
                    description
            );

        } catch (RestClientException e) {

            /*
             * AI failure must NOT prevent complaint submission.
             */

            System.err.println(
                    "AI service unavailable: "
                            + e.getMessage()
            );

            return createFallbackAnalysis(
                    title,
                    description
            );
        }
    }

    // ============================================================
    // NORMALIZE AI RESPONSE
    // ============================================================

    private AiAnalysisResult normalizeResponse(
            AiAnalysisResult response,
            String title,
            String description) {

        if (isBlank(response.getCategory())) {
            response.setCategory("OTHER");
        }

        if (isBlank(response.getPriority())) {
            response.setPriority("MEDIUM");
        }

        if (isBlank(response.getSummary())) {
            response.setSummary(
                    buildFallbackSummary(title, description)
            );
        }

        if (isBlank(response.getDepartment())) {
            response.setDepartment("GENERAL_ADMIN");
        }

        if (response.getConfidence() == null) {
            response.setConfidence(0.0);
        }

        return response;
    }

    // ============================================================
    // FALLBACK ANALYSIS
    // ============================================================

    private AiAnalysisResult createFallbackAnalysis(
            String title,
            String description) {

        return new AiAnalysisResult(
                "OTHER",
                "MEDIUM",
                buildFallbackSummary(title, description),
                "GENERAL_ADMIN",
                0.0,
                Map.of()
        );
    }

    // ============================================================
    // FALLBACK SUMMARY
    // ============================================================

    private String buildFallbackSummary(
            String title,
            String description) {

        if (title == null || title.isBlank()) {
            return description;
        }

        return title.trim();
    }

    // ============================================================
    // STRING VALIDATION
    // ============================================================

    private boolean isBlank(String value) {

        return value == null || value.isBlank();
    }
}