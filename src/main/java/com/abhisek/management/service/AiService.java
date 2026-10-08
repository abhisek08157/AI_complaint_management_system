package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;
import com.abhisek.management.dto.DuplicateAnalysisResult;
import com.abhisek.management.dto.RecurringAnalysisResult;
import com.abhisek.management.entity.Complaint;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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
    // COMPLAINT ANALYSIS
    // ============================================================

    public AiAnalysisResult analyzeComplaint(
            Long complaintId,
            String title,
            String description,
            String location) {

        try {

            Map<String, Object> requestBody =
                    new HashMap<>();

            requestBody.put("complaintId", complaintId);
            requestBody.put("title", title);
            requestBody.put("description", description);
            requestBody.put("location", location);

            Map<String, Object> context =
                    new HashMap<>();

            if (location != null && !location.isBlank()) {
                context.put("location", location);
            }

            requestBody.put("context", context);

            AiAnalysisResult response =
                    restClient.post()
                            .uri("/api/v1/analyze/complaint")
                            .body(requestBody)
                            .retrieve()
                            .body(AiAnalysisResult.class);

            if (response == null) {

                throw new RuntimeException(
                        "AI service returned an empty response"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Failed to communicate with AI service: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ============================================================
    // RECURRING COMPLAINT ANALYSIS
    // ============================================================

    public RecurringAnalysisResult analyzeRecurring(
            Complaint currentComplaint,
            List<Complaint> historicalComplaints) {

        try {

            Map<String, Object> currentComplaintData =
                    buildHistoricalComplaint(currentComplaint);

            List<Map<String, Object>> historicalData =
                    new ArrayList<>();

            for (Complaint complaint : historicalComplaints) {

                historicalData.add(
                        buildHistoricalComplaint(complaint)
                );
            }

            Map<String, Object> requestBody =
                    new HashMap<>();

            requestBody.put(
                    "currentComplaint",
                    currentComplaintData
            );

            requestBody.put(
                    "historicalComplaints",
                    historicalData
            );

            RecurringAnalysisResult response =
                    restClient.post()
                            .uri("/api/v1/analyze/recurring")
                            .body(requestBody)
                            .retrieve()
                            .body(RecurringAnalysisResult.class);

            if (response == null) {

                throw new RuntimeException(
                        "AI service returned an empty recurring-analysis response"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Failed to communicate with AI service for recurring analysis: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ============================================================
    // DUPLICATE COMPLAINT ANALYSIS
    // ============================================================

    public DuplicateAnalysisResult analyzeDuplicate(
            Complaint currentComplaint,
            List<Complaint> historicalComplaints) {

        try {

            Map<String, Object> currentComplaintData =
                    buildHistoricalComplaint(currentComplaint);

            List<Map<String, Object>> historicalData =
                    new ArrayList<>();

            for (Complaint complaint : historicalComplaints) {

                historicalData.add(
                        buildHistoricalComplaint(complaint)
                );
            }

            Map<String, Object> requestBody =
                    new HashMap<>();

            requestBody.put(
                    "currentComplaint",
                    currentComplaintData
            );

            requestBody.put(
                    "historicalComplaints",
                    historicalData
            );

            DuplicateAnalysisResult response =
                    restClient.post()
                            .uri("/api/v1/analyze/duplicate")
                            .body(requestBody)
                            .retrieve()
                            .body(DuplicateAnalysisResult.class);

            if (response == null) {

                throw new RuntimeException(
                        "AI service returned an empty duplicate-analysis response"
                );
            }

            return response;

        } catch (RestClientException e) {

            throw new RuntimeException(
                    "Failed to communicate with AI service for duplicate analysis: "
                            + e.getMessage(),
                    e
            );
        }
    }


    // ============================================================
    // BUILD HISTORICAL COMPLAINT DATA
    // ============================================================

    private Map<String, Object> buildHistoricalComplaint(
            Complaint complaint) {

        Map<String, Object> data =
                new HashMap<>();

        data.put(
                "complaintId",
                complaint.getId()
        );

        data.put(
                "title",
                complaint.getTitle()
        );

        data.put(
                "description",
                complaint.getDescription()
        );

        data.put(
                "location",
                complaint.getLocation()
        );

        data.put(
                "category",
                complaint.getCategory()
        );

        return data;
    }
}