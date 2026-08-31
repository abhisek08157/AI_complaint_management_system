package com.abhisek.management.controller;

import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.dto.StatusUpdateRequest;
import com.abhisek.management.service.Complaintservice;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {

    private final Complaintservice complaintService;

    public StaffController(Complaintservice complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/{staffId}/complaints")
    public ResponseEntity<List<ComplaintResponse>> getAssignedComplaints(@PathVariable Long staffId) {
        return ResponseEntity.ok(complaintService.getComplaintsByStaff(staffId));
    }

    @PutMapping("/complaints/{id}/status")
    public ResponseEntity<ComplaintResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(complaintService.updateStatus(id, request));
    }
}