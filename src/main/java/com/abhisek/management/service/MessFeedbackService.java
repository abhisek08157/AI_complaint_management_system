
package com.abhisek.management.service;

import com.abhisek.management.dto.MessFeedbackRequest;
import com.abhisek.management.dto.MessFeedbackResponse;
import com.abhisek.management.entity.MessFeedback;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.MessFeedbackRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class MessFeedbackService {

    private final MessFeedbackRepository messFeedbackRepository;
    private final CurrentUserService currentUserService;

    public MessFeedbackService(
            MessFeedbackRepository messFeedbackRepository,
            CurrentUserService currentUserService) {
        this.messFeedbackRepository = messFeedbackRepository;
        this.currentUserService = currentUserService;
    }

    // Student submits feedback
    @Transactional
    public MessFeedbackResponse submitFeedback(
            MessFeedbackRequest request) {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can submit mess feedback"
            );
        }

        if (request.getFeedbackDate() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Feedback date is required"
            );
        }

        if (request.getFeedbackDate().isAfter(LocalDate.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Feedback date cannot be in the future"
            );
        }

        String mealType = normalizeMealType(request.getMealType());

        validateRating(
                request.getFoodQualityRating(),
                "Food quality"
        );

        validateRating(
                request.getHygieneRating(),
                "Hygiene"
        );

        validateRating(
                request.getOverallRating(),
                "Overall"
        );

        if (request.getComments() != null
                && request.getComments().length() > 2000) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Comments cannot exceed 2000 characters"
            );
        }

        if (messFeedbackRepository
                .existsByStudentAndFeedbackDateAndMealType(
                        student,
                        request.getFeedbackDate(),
                        mealType)) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "You have already submitted feedback for this meal"
            );
        }

        MessFeedback feedback = new MessFeedback();

        feedback.setStudent(student);
        feedback.setFeedbackDate(request.getFeedbackDate());
        feedback.setMealType(mealType);
        feedback.setFoodQualityRating(
                request.getFoodQualityRating()
        );
        feedback.setHygieneRating(
                request.getHygieneRating()
        );
        feedback.setOverallRating(
                request.getOverallRating()
        );

        String comments = request.getComments();

        feedback.setComments(
                comments == null || comments.isBlank()
                        ? null
                        : comments.trim()
        );

        MessFeedback savedFeedback =
                messFeedbackRepository.save(feedback);

        return new MessFeedbackResponse(savedFeedback);
    }

    // Student views only their own feedback
    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getMyFeedback() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can view their own feedback"
            );
        }

        return messFeedbackRepository
                .findByStudentOrderByCreatedAtDesc(student)
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    // Admin and hostel warden view all feedback
    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getAllFeedback() {

        requireFeedbackReviewer();

        return messFeedbackRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    // Admin and hostel warden filter feedback by date
    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getFeedbackByDate(
            LocalDate date) {

        requireFeedbackReviewer();

        if (date == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Feedback date is required"
            );
        }

        return messFeedbackRepository
                .findByFeedbackDateOrderByCreatedAtDesc(date)
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    // Admin and hostel warden filter feedback by meal type
    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getFeedbackByMealType(
            String mealType) {

        requireFeedbackReviewer();

        String normalizedMealType =
                normalizeMealType(mealType);

        return messFeedbackRepository
                .findByMealTypeOrderByCreatedAtDesc(
                        normalizedMealType
                )
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    // Only ADMIN and HOSTEL_WARDEN can review all feedback
    private void requireFeedbackReviewer() {

        User user = currentUserService.getCurrentUser();

        String role = String.valueOf(user.getRole());

        if (!"ADMIN".equalsIgnoreCase(role)
                && !"HOSTEL_WARDEN".equalsIgnoreCase(role)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins and hostel wardens can review mess feedback"
            );
        }
    }

    // Validate ratings from 1 to 5
    private void validateRating(
            Integer rating,
            String fieldName) {

        if (rating == null || rating < 1 || rating > 5) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " rating must be between 1 and 5"
            );
        }
    }

    // Normalize and validate meal type
    private String normalizeMealType(String mealType) {

        if (mealType == null || mealType.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Meal type is required"
            );
        }

        String normalized =
                mealType.trim().toUpperCase(Locale.ROOT);

        if (!List.of(
                "BREAKFAST",
                "LUNCH",
                "SNACKS",
                "DINNER"
        ).contains(normalized)) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Meal type must be BREAKFAST, LUNCH, SNACKS, or DINNER"
            );
        }

        return normalized;
    }
}
