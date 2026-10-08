package com.abhisek.management.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // ============================================================
    // BASIC COMPLAINT INFORMATION
    // ============================================================

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private String location;

    private String category;

    private String priority;

    @Column(length = 2000)
    private String summary;


    // ============================================================
    // AI DUPLICATE ANALYSIS
    // ============================================================

    @Column(nullable = false)
    private boolean possibleDuplicate = false;

    private Long matchedComplaintId;

    @Column(length = 2000)
    private String duplicateReason;


    // ============================================================
    // AI RECURRING ISSUE ANALYSIS
    // ============================================================

    @Column(nullable = false)
    private boolean possibleRecurringIssue = false;

    @Column(length = 2000)
    private String recurringReason;


    // ============================================================
    // COMPLAINT STATUS
    // ============================================================

    private String status;

    @Column(length = 2000)
    private String resolution;


    // ============================================================
    // STUDENT RESOLUTION CONFIRMATION
    // ============================================================

    @Column(nullable = false)
    private boolean studentConfirmed = false;

    private LocalDateTime confirmedAt;



    // ============================================================
    // COMPLAINT PHOTO / EVIDENCE
    // ============================================================

    @Lob
    @Column(name = "photo", columnDefinition = "LONGBLOB")
    private byte[] photo;

    @Column(name = "photo_name")
    private String photoName;

    @Column(name = "photo_content_type")
    private String photoContentType;


    // ============================================================
    // USERS
    // ============================================================

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;


    // ============================================================
    // TIMESTAMPS
    // ============================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public Complaint() {
    }


    // ============================================================
    // PRE-PERSIST
    // ============================================================

    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (status == null) {
            status = "SUBMITTED";
        }
    }


    // ============================================================
    // PRE-UPDATE
    // ============================================================

    @PreUpdate
    public void preUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // ============================================================
    // ID
    // ============================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    // ============================================================
    // TITLE
    // ============================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    // ============================================================
    // DESCRIPTION
    // ============================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // ============================================================
    // LOCATION
    // ============================================================

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    // ============================================================
    // CATEGORY
    // ============================================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    // ============================================================
    // PRIORITY
    // ============================================================

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }


    // ============================================================
    // SUMMARY
    // ============================================================

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }


    // ============================================================
    // AI DUPLICATE ANALYSIS
    // ============================================================

    public boolean isPossibleDuplicate() {
        return possibleDuplicate;
    }

    public void setPossibleDuplicate(boolean possibleDuplicate) {
        this.possibleDuplicate = possibleDuplicate;
    }

    public Long getMatchedComplaintId() {
        return matchedComplaintId;
    }

    public void setMatchedComplaintId(Long matchedComplaintId) {
        this.matchedComplaintId = matchedComplaintId;
    }

    public String getDuplicateReason() {
        return duplicateReason;
    }

    public void setDuplicateReason(String duplicateReason) {
        this.duplicateReason = duplicateReason;
    }


    // ============================================================
    // AI RECURRING ISSUE ANALYSIS
    // ============================================================

    public boolean isPossibleRecurringIssue() {
        return possibleRecurringIssue;
    }

    public void setPossibleRecurringIssue(boolean possibleRecurringIssue) {
        this.possibleRecurringIssue = possibleRecurringIssue;
    }

    public String getRecurringReason() {
        return recurringReason;
    }

    public void setRecurringReason(String recurringReason) {
        this.recurringReason = recurringReason;
    }


    // ============================================================
    // STATUS
    // ============================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    // ============================================================
    // RESOLUTION
    // ============================================================

    public String getResolution() {
        return resolution;
    }

    public void setResolution(String resolution) {
        this.resolution = resolution;
    }


    // ============================================================
    // STUDENT RESOLUTION CONFIRMATION
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



    // ============================================================
    // COMPLAINT PHOTO / EVIDENCE
    // ============================================================

    public byte[] getPhoto() {
        return photo;
    }

    public void setPhoto(byte[] photo) {
        this.photo = photo;
    }

    public String getPhotoName() {
        return photoName;
    }

    public void setPhotoName(String photoName) {
        this.photoName = photoName;
    }

    public String getPhotoContentType() {
        return photoContentType;
    }

    public void setPhotoContentType(String photoContentType) {
        this.photoContentType = photoContentType;
    }


    // ============================================================
    // STUDENT / USER
    // ============================================================

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }


    // ============================================================
    // ASSIGNED STAFF
    // ============================================================

    public User getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(User assignedStaff) {
        this.assignedStaff = assignedStaff;
    }


    // ============================================================
    // CREATED AT
    // ============================================================

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    // ============================================================
    // UPDATED AT
    // ============================================================

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }


    // ============================================================
    // RESOLVED AT
    // ============================================================

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}