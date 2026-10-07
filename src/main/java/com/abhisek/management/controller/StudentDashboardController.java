package com.abhisek.management.controller;

import com.abhisek.management.dto.StudentDashboardResponse;
import com.abhisek.management.service.StudentDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/dashboard")
public class StudentDashboardController {

    private final StudentDashboardService studentDashboardService;

    public StudentDashboardController(
            StudentDashboardService studentDashboardService) {
        this.studentDashboardService = studentDashboardService;
    }

    @GetMapping
    public ResponseEntity<StudentDashboardResponse> getDashboard() {
        return ResponseEntity.ok(
                studentDashboardService.getDashboard()
        );
    }
}