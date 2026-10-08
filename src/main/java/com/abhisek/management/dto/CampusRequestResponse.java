package com.abhisek.management.dto;

import com.abhisek.management.entity.CampusRequest;

import java.time.LocalDateTime;

public class CampusRequestResponse {

    private Long id;

    private String requestType;

    private String description;

    private String status;

    private String adminRemarks;

    private Long userId;

    private String userName;

    private String userEmail;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime completedAt;

    private boolean certificateAvailable;


    public CampusRequestResponse(CampusRequest request) {

        this.id = request.getId();

        this.requestType =
                request.getRequestType();

        this.description =
                request.getDescription();

        this.status =
                request.getStatus();

        this.adminRemarks =
                request.getAdminRemarks();


        if (request.getUser() != null) {

            this.userId =
                    request.getUser().getId();

            this.userName =
                    request.getUser().getName();

            this.userEmail =
                    request.getUser().getEmail();
        }


        this.createdAt =
                request.getCreatedAt();

        this.updatedAt =
                request.getUpdatedAt();

        this.completedAt =
                request.getCompletedAt();


        this.certificateAvailable =
                "APPROVED".equalsIgnoreCase(
                        request.getStatus()
                )
                ||
                "COMPLETED".equalsIgnoreCase(
                        request.getStatus()
                );
    }


    public Long getId() {
        return id;
    }

    public String getRequestType() {
        return requestType;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public boolean isCertificateAvailable() {
        return certificateAvailable;
    }
}