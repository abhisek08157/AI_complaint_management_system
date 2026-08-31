package com.abhisek.management.dto;

public class DashboardResponse {

    private long total;
    private long submitted;
    private long assigned;
    private long inProgress;
    private long resolved;

    public DashboardResponse(long total, long submitted, long assigned, long inProgress, long resolved) {
        this.total = total;
        this.submitted = submitted;
        this.assigned = assigned;
        this.inProgress = inProgress;
        this.resolved = resolved;
    }

    public long getTotal() { return total; }
    public long getSubmitted() { return submitted; }
    public long getAssigned() { return assigned; }
    public long getInProgress() { return inProgress; }
    public long getResolved() { return resolved; }
}