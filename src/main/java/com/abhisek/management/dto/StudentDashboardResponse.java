package com.abhisek.management.dto;

public class StudentDashboardResponse {
    private long totalComplaints;
    private long pendingComplaints;
    private long totalCampusRequests;
    private long pendingCampusRequests;
    private long totalGatePasses;
    private long pendingGatePasses;

    public StudentDashboardResponse(
            long totalComplaints,
            long pendingComplaints,
            long totalCampusRequests,
            long pendingCampusRequests,
            long totalGatePasses,
            long pendingGatePasses) {

        this.totalComplaints = totalComplaints;
        this.pendingComplaints = pendingComplaints;
        this.totalCampusRequests = totalCampusRequests;
        this.pendingCampusRequests = pendingCampusRequests;
        this.totalGatePasses = totalGatePasses;
        this.pendingGatePasses = pendingGatePasses;
    }

    public long getTotalComplaints() { return totalComplaints; }
    public long getPendingComplaints() { return pendingComplaints; }
    public long getTotalCampusRequests() { return totalCampusRequests; }
    public long getPendingCampusRequests() { return pendingCampusRequests; }
    public long getTotalGatePasses() { return totalGatePasses; }
    public long getPendingGatePasses() { return pendingGatePasses; }
}