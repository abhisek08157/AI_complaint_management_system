package com.abhisek.management.dto;

import com.abhisek.management.entity.Announcement;

import java.time.LocalDateTime;

public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String category;
    private String targetAudience;
    private String status;

    private LocalDateTime publishAt;
    private LocalDateTime expiresAt;

    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private String createdByRole;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructor used by AnnouncementService
    public AnnouncementResponse(Announcement announcement) {

        this.id = announcement.getId();
        this.title = announcement.getTitle();
        this.content = announcement.getContent();
        this.category = announcement.getCategory();
        this.targetAudience = announcement.getTargetAudience();
        this.status = announcement.getStatus();

        this.publishAt = announcement.getPublishAt();
        this.expiresAt = announcement.getExpiresAt();

        if (announcement.getCreatedBy() != null) {

            this.createdById =
                    announcement.getCreatedBy().getId();

            this.createdByName =
                    announcement.getCreatedBy().getName();

            this.createdByEmail =
                    announcement.getCreatedBy().getEmail();

            this.createdByRole =
                    announcement.getCreatedBy().getRole();
        }

        this.createdAt = announcement.getCreatedAt();
        this.updatedAt = announcement.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public String getCategory() {
        return category;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getPublishAt() {
        return publishAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public String getCreatedByEmail() {
        return createdByEmail;
    }

    public String getCreatedByRole() {
        return createdByRole;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}