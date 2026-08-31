package com.abhisek.management.dto;

// A small carrier object: the AI service fills this in, ComplaintService reads it.
public class AiAnalysisResult {

    private String category;
    private String priority;
    private String summary;

    public AiAnalysisResult(String category, String priority, String summary) {
        this.category = category;
        this.priority = priority;
        this.summary = summary;
    }

    public String getCategory() { return category; }
    public String getPriority() { return priority; }
    public String getSummary() { return summary; }
}