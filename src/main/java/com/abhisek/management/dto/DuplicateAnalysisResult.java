package com.abhisek.management.dto;

public class DuplicateAnalysisResult {

    private boolean possibleDuplicate;
    private Long matchedComplaintId;
    private String similarityReason;

    public DuplicateAnalysisResult() {
    }

    public boolean isPossibleDuplicate() {
        return possibleDuplicate;
    }

    public void setPossibleDuplicate(boolean possibleDuplicate) {
        this.possibleDuplicate = possibleDuplicate;
    }

    public Long getMatchedComplaintId() {
        return matchedComplaintId;
    }

    public void setMatchedComplaintId(Long matchedComplaintId) {
        this.matchedComplaintId = matchedComplaintId;
    }

    public String getSimilarityReason() {
        return similarityReason;
    }

    public void setSimilarityReason(String similarityReason) {
        this.similarityReason = similarityReason;
    }
}