
package com.abhisek.management.dto;

public class WardenDashboardResponse {

    private long totalRequests;
    private long pending;
    private long approved;
    private long rejected;
    private long currentlyOutside;
    private long completed;

    public WardenDashboardResponse() {
    }

    public WardenDashboardResponse(
            long totalRequests,
            long pending,
            long approved,
            long rejected,
            long currentlyOutside,
            long completed) {

        this.totalRequests = totalRequests;
        this.pending = pending;
        this.approved = approved;
        this.rejected = rejected;
        this.currentlyOutside = currentlyOutside;
        this.completed = completed;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public long getPending() {
        return pending;
    }

    public long getApproved() {
        return approved;
    }

    public long getRejected() {
        return rejected;
    }

    public long getCurrentlyOutside() {
        return currentlyOutside;
    }

    public long getCompleted() {
        return completed;
    }
}
