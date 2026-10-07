package com.abhisek.management.controller;

import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.service.Complaintservice;
import com.abhisek.management.service.CurrentUserService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final Complaintservice complaintService;
    private final CurrentUserService currentUserService;

    public ComplaintController(
            Complaintservice complaintService,
            CurrentUserService currentUserService) {

        this.complaintService = complaintService;
        this.currentUserService = currentUserService;
    }

    // ============================================================
    // CREATE COMPLAINT
    // ============================================================

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @RequestBody ComplaintRequest request) {

        Long userId = currentUserService
                .getCurrentUser()
                .getId();

        ComplaintResponse response =
                complaintService.createComplaint(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ============================================================
    // GET ALL COMPLAINTS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // ============================================================
    // GET COMPLAINT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaintById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }

    // ============================================================
    // GET CURRENT USER'S COMPLAINTS
    // ============================================================

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {

        Long userId = currentUserService
                .getCurrentUser()
                .getId();

        return ResponseEntity.ok(
                complaintService.getComplaintsByUser(userId)
        );
    }
}