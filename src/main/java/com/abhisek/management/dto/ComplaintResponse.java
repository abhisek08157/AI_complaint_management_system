package com.abhisek.management.dto;

import com.abhisek.management.entity.Complaint;
import java.time.LocalDateTime;

public class ComplaintResponse {

    private Long id;

    private String title;

    private String description;

    private String location;

    private String category;

    private String priority;

    private String summary;

    // AI Duplicate Analysis
    private boolean possibleDuplicate;

    private Long matchedComplaintId;

    private String duplicateReason;

    // AI Recurring Analysis
    private boolean possibleRecurringIssue;

    private String recurringReason;

    private String status;

    private String resolution;
    

    private String submittedBy;

    private String assignedStaff;
    private boolean studentConfirmed;
    private LocalDateTime confirmedAt;

    // Complaint photo / evidence
    private boolean photoAvailable;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public ComplaintResponse(Complaint complaint) {

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


        // ========================================================
        // AI DUPLICATE ANALYSIS
        // ========================================================

        this.possibleDuplicate =
                complaint.isPossibleDuplicate();

        this.matchedComplaintId =
                complaint.getMatchedComplaintId();

        this.duplicateReason =
                complaint.getDuplicateReason();


        // ========================================================
        // AI RECURRING ANALYSIS
        // ========================================================

        this.possibleRecurringIssue =
                complaint.isPossibleRecurringIssue();

        this.recurringReason =
                complaint.getRecurringReason();


        // ========================================================
        // COMPLAINT STATUS
        // ========================================================

        this.status =
                complaint.getStatus();

        this.resolution =
                complaint.getResolution();
        this.studentConfirmed =
                complaint.isStudentConfirmed();

        this.confirmedAt =
                complaint.getConfirmedAt();

        this.photoAvailable =
                complaint.getPhoto() != null
                        && complaint.getPhoto().length > 0;


        // ========================================================
        // STUDENT
        // ========================================================

        if (complaint.getUser() != null) {

            this.submittedBy =
                    complaint.getUser().getName();
        }


        // ========================================================
        // ASSIGNED STAFF
        // ========================================================

        if (complaint.getAssignedStaff() != null) {

            this.assignedStaff =
                    complaint.getAssignedStaff()
                            .getName();
        }
    }


    // ============================================================
    // GETTERS
    // ============================================================

    public boolean isStudentConfirmed() {
		return studentConfirmed;
	}


	public void setStudentConfirmed(boolean studentConfirmed) {
		this.studentConfirmed = studentConfirmed;
	}


	public LocalDateTime getConfirmedAt() {
		return confirmedAt;
	}


	public void setConfirmedAt(LocalDateTime confirmedAt) {
		this.confirmedAt = confirmedAt;
	}
    public boolean isPhotoAvailable() {
        return photoAvailable;
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

    public boolean isPossibleDuplicate() {
        return possibleDuplicate;
    }

    public Long getMatchedComplaintId() {
        return matchedComplaintId;
    }

    public String getDuplicateReason() {
        return duplicateReason;
    }

    public boolean isPossibleRecurringIssue() {
        return possibleRecurringIssue;
    }

    public String getRecurringReason() {
        return recurringReason;
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


    // ============================================================
    // SETTERS
    // ============================================================
    public void setPhotoAvailable(boolean photoAvailable) {
        this.photoAvailable = photoAvailable;
    }


    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setPossibleDuplicate(
            boolean possibleDuplicate) {

        this.possibleDuplicate =
                possibleDuplicate;
    }

    public void setMatchedComplaintId(
            Long matchedComplaintId) {

        this.matchedComplaintId =
                matchedComplaintId;
    }

    public void setDuplicateReason(
            String duplicateReason) {

        this.duplicateReason =
                duplicateReason;
    }

    public void setPossibleRecurringIssue(
            boolean possibleRecurringIssue) {

        this.possibleRecurringIssue =
                possibleRecurringIssue;
    }

    public void setRecurringReason(
            String recurringReason) {

        this.recurringReason =
                recurringReason;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }

    public void setSubmittedBy(String submittedBy) {
        this.submittedBy = submittedBy;
    }

    public void setAssignedStaff(String assignedStaff) {
        this.assignedStaff = assignedStaff;
    }
}