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
            @Value("${ai.service.url:http://127.0.0.1:8000}") String aiServiceUrl) {

        this.restClient = RestClient.builder()
                .baseUrl(aiServiceUrl)
                .build();
    }

    public AiAnalysisResult analyzeComplaint(
            String title,
            String description) {

        try {

            Map<String, String> requestBody = Map.of(
                    "title", title,
                    "description", description
            );

            AiAnalysisResult response = restClient.post()
                    .uri("/analyze")
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
                            + e.getMessage(), e
            );
        }
    }
}