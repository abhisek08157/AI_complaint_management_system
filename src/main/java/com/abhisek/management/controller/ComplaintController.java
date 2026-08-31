package com.abhisek.management.controller;

import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.service.Complaintservice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final Complaintservice complaintService;

    public ComplaintController(Complaintservice complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestParam Long userId,
            @RequestBody ComplaintRequest request) {

        ComplaintResponse response = complaintService.createComplaint(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaintById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ComplaintResponse>> getComplaintsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(complaintService.getComplaintsByUser(userId));
    }
}