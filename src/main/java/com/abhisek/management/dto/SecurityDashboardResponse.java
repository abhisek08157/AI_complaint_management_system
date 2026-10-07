package com.abhisek.management.dto;

public class SecurityDashboardResponse {

    private long todayExits;
    private long todayEntries;
    private long currentlyOutside;
    private long totalScansToday;

    public SecurityDashboardResponse(long todayExits, long todayEntries,
                                     long currentlyOutside, long totalScansToday) {
        this.todayExits = todayExits;
        this.todayEntries = todayEntries;
        this.currentlyOutside = currentlyOutside;
        this.totalScansToday = totalScansToday;
    }

    public long getTodayExits() {
        return todayExits;
    }

    public long getTodayEntries() {
        return todayEntries;
    }

    public long getCurrentlyOutside() {
        return currentlyOutside;
    }

    public long getTotalScansToday() {
        return totalScansToday;
    }
}