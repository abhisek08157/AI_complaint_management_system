
package com.abhisek.management.controller;

import com.abhisek.management.dto.WardenDashboardResponse;
import com.abhisek.management.service.WardenDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/warden/dashboard")
public class WardenDashboardController {

    private final WardenDashboardService wardenDashboardService;

    public WardenDashboardController(
            WardenDashboardService wardenDashboardService) {

        this.wardenDashboardService = wardenDashboardService;
    }

    @GetMapping
    public ResponseEntity<WardenDashboardResponse> getDashboard() {
        return ResponseEntity.ok(
                wardenDashboardService.getDashboard()
        );
    }
}
