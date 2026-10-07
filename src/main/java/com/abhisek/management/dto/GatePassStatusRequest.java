package com.abhisek.management.dto;

public class GatePassStatusRequest {

    private String status;
    private String wardenRemarks;

    public GatePassStatusRequest() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getWardenRemarks() {
        return wardenRemarks;
    }

    public void setWardenRemarks(String wardenRemarks) {
        this.wardenRemarks = wardenRemarks;
    }
}