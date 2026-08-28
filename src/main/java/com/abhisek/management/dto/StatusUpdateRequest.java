package com.abhisek.management.dto;

public class StatusUpdateRequest {

    private String status;

    private String resolution;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getResolution() {
        return resolution;
    }

    public void setResolution(
            String resolution) {

        this.resolution = resolution;
    }
}