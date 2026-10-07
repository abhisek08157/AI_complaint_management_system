package com.abhisek.management.controller;

import com.abhisek.management.dto.StaffDashboardResponse;
import com.abhisek.management.service.StaffDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/dashboard")
public class StaffDashboardController {

    private final StaffDashboardService staffDashboardService;

    public StaffDashboardController(
            StaffDashboardService staffDashboardService) {

        this.staffDashboardService = staffDashboardService;
    }

    @GetMapping
    public ResponseEntity<StaffDashboardResponse> getDashboard() {

        return ResponseEntity.ok(
                staffDashboardService.getDashboard()
        );
    }
}