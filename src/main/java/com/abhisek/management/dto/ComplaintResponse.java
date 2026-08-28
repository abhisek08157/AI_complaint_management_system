package com.abhisek.management.dto;

import com.abhisek.management.entity.Complaint;

public class ComplaintResponse {

    private Long id;

    private String title;

    private String description;

    private String location;

    private String category;

    private String priority;

    private String summary;

    private String status;

    private String resolution;

    private String submittedBy;

    private String assignedStaff;

    public ComplaintResponse(
            Complaint complaint) {

        this.id = complaint.getId();

        this.title = complaint.getTitle();

        this.description =
                complaint.getDescription();

        this.location =
                complaint.getLocation();

        this.category =
                complaint.getCategory();

        this.priority =
                complaint.getPriority();

        this.summary =
                complaint.getSummary();

        this.status =
                complaint.getStatus();

        this.resolution =
                complaint.getResolution();

        if (complaint.getUser() != null) {

            this.submittedBy =
                    complaint.getUser().getName();
        }

        if (complaint.getAssignedStaff() != null) {

            this.assignedStaff =
                    complaint.getAssignedStaff()
                            .getName();
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public String getCategory() {
        return category;
    }

    public String getPriority() {
        return priority;
    }

    public String getSummary() {
        return summary;
    }

    public String getStatus() {
        return status;
    }

    public String getResolution() {
        return resolution;
    }

    public String getSubmittedBy() {
        return submittedBy;
    }

    public String getAssignedStaff() {
        return assignedStaff;
    }
}