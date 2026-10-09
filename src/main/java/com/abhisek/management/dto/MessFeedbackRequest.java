
package com.abhisek.management.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MessFeedbackRequest {

    @NotNull(message = "Feedback date is required")
    private LocalDate feedbackDate;

    @NotBlank(message = "Meal type is required")
    @Pattern(
        regexp = "(?i)BREAKFAST|LUNCH|SNACKS|DINNER",
        message = "Meal type must be BREAKFAST, LUNCH, SNACKS or DINNER"
    )
    private String mealType;

    @NotNull(message = "Food quality rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer foodQualityRating;

    @NotNull(message = "Hygiene rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer hygieneRating;

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private Integer overallRating;

    @Size(max = 2000, message = "Comments cannot exceed 2000 characters")
    private String comments;

    public LocalDate getFeedbackDate() {
        return feedbackDate;
    }

    public void setFeedbackDate(LocalDate feedbackDate) {
        this.feedbackDate = feedbackDate;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public Integer getFoodQualityRating() {
        return foodQualityRating;
    }

    public void setFoodQualityRating(Integer foodQualityRating) {
        this.foodQualityRating = foodQualityRating;
    }

    public Integer getHygieneRating() {
        return hygieneRating;
    }

    public void setHygieneRating(Integer hygieneRating) {
        this.hygieneRating = hygieneRating;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Integer overallRating) {
        this.overallRating = overallRating;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }
}
