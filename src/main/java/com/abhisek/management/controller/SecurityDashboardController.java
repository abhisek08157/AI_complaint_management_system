package com.abhisek.management.controller;

import com.abhisek.management.dto.SecurityDashboardResponse;
import com.abhisek.management.service.SecurityDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/security/dashboard")
public class SecurityDashboardController {

    private final SecurityDashboardService securityDashboardService;

    public SecurityDashboardController(
            SecurityDashboardService securityDashboardService) {
        this.securityDashboardService = securityDashboardService;
    }

    @GetMapping
    public ResponseEntity<SecurityDashboardResponse> getDashboard() {
        return ResponseEntity.ok(
                securityDashboardService.getDashboard()
        );
    }
}