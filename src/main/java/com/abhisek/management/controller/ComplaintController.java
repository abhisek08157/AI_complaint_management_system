package com.abhisek.management.controller;

import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.DuplicateAnalysisResult;
import com.abhisek.management.dto.RecurringAnalysisResult;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.service.Complaintservice;
import com.abhisek.management.service.CurrentUserService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.abhisek.management.dto.ResolutionConfirmationRequest;

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
    @PostMapping("/{id}/ai/recurring")
    public ResponseEntity<RecurringAnalysisResult> analyzeRecurring(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.analyzeRecurringIssue(id)
        );
    }
    @PostMapping("/{id}/ai/duplicate")
    public ResponseEntity<DuplicateAnalysisResult> analyzeDuplicate(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                complaintService.analyzeDuplicateComplaint(id)
        );
    }
    
 // ============================================================
 // STUDENT - CONFIRM COMPLAINT RESOLUTION
 // ============================================================

 @PutMapping("/{id}/confirm-resolution")
 public ResponseEntity<ComplaintResponse> confirmResolution(
         @PathVariable Long id,
         @RequestBody ResolutionConfirmationRequest request) {

     ComplaintResponse response =
             complaintService.confirmResolution(
                     id,
                     request.isConfirmed()
             );

     return ResponseEntity.ok(response);
 }


    // ============================================================
    // STUDENT - UPLOAD COMPLAINT PHOTO
    // ============================================================

    @PostMapping("/{id}/photo")
    public ResponseEntity<String> uploadComplaintPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        complaintService.uploadComplaintPhoto(id, file);

        return ResponseEntity.ok(
                "Complaint photo uploaded successfully"
        );
    }


    // ============================================================
    // VIEW COMPLAINT PHOTO
    // ============================================================

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getComplaintPhoto(
            @PathVariable Long id) {

        var complaint =
                complaintService.getComplaintPhoto(id);

        if (complaint.getPhoto() == null ||
                complaint.getPhoto().length == 0) {

            return ResponseEntity.notFound().build();
        }

        MediaType mediaType;

        try {
            mediaType = MediaType.parseMediaType(
                    complaint.getPhotoContentType()
            );
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        String fileName = complaint.getPhotoName();

        if (fileName == null || fileName.isBlank()) {
            fileName = "complaint-photo";
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + fileName + "\""
                )
                .contentType(mediaType)
                .body(complaint.getPhoto());
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