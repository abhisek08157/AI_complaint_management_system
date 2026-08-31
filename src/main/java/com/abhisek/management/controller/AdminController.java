package com.abhisek.management.controller;

import com.abhisek.management.dto.AssignRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.dto.DashboardResponse;
import com.abhisek.management.dto.UserResponse;
import com.abhisek.management.service.Complaintservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final Complaintservice complaintService;

    public AdminController(Complaintservice complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/staff")
    public ResponseEntity<List<UserResponse>> getStaffList() {
        return ResponseEntity.ok(complaintService.getStaffList());
    }

    @PutMapping("/complaints/{id}/assign")
    public ResponseEntity<ComplaintResponse> assignStaff(
            @PathVariable Long id,
            @RequestBody AssignRequest request) {
        return ResponseEntity.ok(complaintService.assignStaff(id, request.getStaffId()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(complaintService.getDashboardStats());
    }
}