package com.abhisek.management.dto;

import java.util.Map;

public class AiAnalysisResult {

    private String category;
    private String priority;
    private String summary;
    private String department;
    private Double confidence;
    private Map<String, String> entities;

    public AiAnalysisResult() {
    }

    public AiAnalysisResult(
            String category,
            String priority,
            String summary,
            String department,
            Double confidence,
            Map<String, String> entities) {

        this.category = category;
        this.priority = priority;
        this.summary = summary;
        this.department = department;
        this.confidence = confidence;
        this.entities = entities;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public Map<String, String> getEntities() {
        return entities;
    }

    public void setEntities(Map<String, String> entities) {
        this.entities = entities;
    }
}