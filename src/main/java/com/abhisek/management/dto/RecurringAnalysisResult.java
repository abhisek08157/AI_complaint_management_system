package com.abhisek.management.dto;

public class RecurringAnalysisResult {

    private boolean possibleRecurringIssue;
    private String reason;

    public RecurringAnalysisResult() {
    }

    public boolean isPossibleRecurringIssue() {
        return possibleRecurringIssue;
    }

    public void setPossibleRecurringIssue(boolean possibleRecurringIssue) {
        this.possibleRecurringIssue = possibleRecurringIssue;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}