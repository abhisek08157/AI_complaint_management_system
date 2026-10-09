
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

    @Transactional
    public MessFeedbackResponse submitFeedback(MessFeedbackRequest request) {

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

        validateRating(request.getFoodQualityRating(), "Food quality");
        validateRating(request.getHygieneRating(), "Hygiene");
        validateRating(request.getOverallRating(), "Overall");

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
        feedback.setFoodQualityRating(request.getFoodQualityRating());
        feedback.setHygieneRating(request.getHygieneRating());
        feedback.setOverallRating(request.getOverallRating());

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

    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getAllFeedback() {

        requireAdmin();

        return messFeedbackRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getFeedbackByDate(
            LocalDate date) {

        requireAdmin();

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

    @Transactional(readOnly = true)
    public List<MessFeedbackResponse> getFeedbackByMealType(
            String mealType) {

        requireAdmin();

        String normalizedMealType = normalizeMealType(mealType);

        return messFeedbackRepository
                .findByMealTypeOrderByCreatedAtDesc(normalizedMealType)
                .stream()
                .map(MessFeedbackResponse::new)
                .toList();
    }

    private void requireAdmin() {

        User user = currentUserService.getCurrentUser();

        if (!"ADMIN".equalsIgnoreCase(
                String.valueOf(user.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can review mess feedback"
            );
        }
    }

    private void validateRating(Integer rating, String fieldName) {

        if (rating == null || rating < 1 || rating > 5) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    fieldName + " rating must be between 1 and 5"
            );
        }
    }

    private String normalizeMealType(String mealType) {

        if (mealType == null || mealType.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Meal type is required"
            );
        }

        String normalized = mealType.trim().toUpperCase(Locale.ROOT);

        if (!List.of("BREAKFAST", "LUNCH", "SNACKS", "DINNER")
                .contains(normalized)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Meal type must be BREAKFAST, LUNCH, SNACKS, or DINNER"
            );
        }

        return normalized;
    }
}
