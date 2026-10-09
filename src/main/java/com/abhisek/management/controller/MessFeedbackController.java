
package com.abhisek.management.controller;

import com.abhisek.management.dto.MessFeedbackRequest;
import com.abhisek.management.dto.MessFeedbackResponse;
import com.abhisek.management.service.MessFeedbackService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mess-feedback")
public class MessFeedbackController {

    private final MessFeedbackService messFeedbackService;

    public MessFeedbackController(
            MessFeedbackService messFeedbackService) {
        this.messFeedbackService = messFeedbackService;
    }

    // Student submits feedback
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessFeedbackResponse submitFeedback(
            @Valid @RequestBody MessFeedbackRequest request) {
        return messFeedbackService.submitFeedback(request);
    }

    // Student views their own feedback
    @GetMapping("/my")
    public List<MessFeedbackResponse> getMyFeedback() {
        return messFeedbackService.getMyFeedback();
    }

    // Admin views all feedback
    @GetMapping
    public List<MessFeedbackResponse> getAllFeedback() {
        return messFeedbackService.getAllFeedback();
    }

    // Admin filters feedback by date
    @GetMapping("/by-date")
    public List<MessFeedbackResponse> getFeedbackByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return messFeedbackService.getFeedbackByDate(date);
    }

    // Admin filters feedback by meal type
    @GetMapping("/by-meal")
    public List<MessFeedbackResponse> getFeedbackByMealType(
            @RequestParam String mealType) {
        return messFeedbackService.getFeedbackByMealType(mealType);
    }
}
