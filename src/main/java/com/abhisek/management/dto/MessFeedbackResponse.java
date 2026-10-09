
package com.abhisek.management.dto;

import com.abhisek.management.entity.MessFeedback;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MessFeedbackResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private LocalDate feedbackDate;
    private String mealType;
    private Integer foodQualityRating;
    private Integer hygieneRating;
    private Integer overallRating;
    private String comments;
    private LocalDateTime createdAt;

    public MessFeedbackResponse(MessFeedback feedback) {
        this.id = feedback.getId();

        if (feedback.getStudent() != null) {
            this.studentId = feedback.getStudent().getId();
            this.studentName = feedback.getStudent().getName();
        }

        this.feedbackDate = feedback.getFeedbackDate();
        this.mealType = feedback.getMealType();
        this.foodQualityRating = feedback.getFoodQualityRating();
        this.hygieneRating = feedback.getHygieneRating();
        this.overallRating = feedback.getOverallRating();
        this.comments = feedback.getComments();
        this.createdAt = feedback.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public LocalDate getFeedbackDate() {
        return feedbackDate;
    }

    public String getMealType() {
        return mealType;
    }

    public Integer getFoodQualityRating() {
        return foodQualityRating;
    }

    public Integer getHygieneRating() {
        return hygieneRating;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public String getComments() {
        return comments;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
