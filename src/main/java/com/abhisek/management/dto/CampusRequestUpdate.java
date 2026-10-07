package com.abhisek.management.dto;

public class CampusRequestUpdate {

    private String status;
    private String adminRemarks;

    public CampusRequestUpdate() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }
}