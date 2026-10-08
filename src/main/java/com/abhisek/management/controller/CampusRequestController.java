package com.abhisek.management.controller;

import com.abhisek.management.dto.CampusRequestCreate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.abhisek.management.dto.CampusRequestResponse;
import com.abhisek.management.dto.CampusRequestUpdate;
import com.abhisek.management.service.CampusRequestService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class CampusRequestController {

    private final CampusRequestService requestService;

    public CampusRequestController(
            CampusRequestService requestService) {

        this.requestService = requestService;
    }
 // ============================================================
 // STUDENT - DOWNLOAD CERTIFICATE
 // ============================================================

 @GetMapping("/{id}/certificate")
 public ResponseEntity<byte[]> downloadCertificate(
         @PathVariable Long id) {

     byte[] pdf =
             requestService.downloadCertificate(id);


     return ResponseEntity.ok()
             .header(
                     HttpHeaders.CONTENT_DISPOSITION,
                     "attachment; filename=\"CampusOne_Certificate_"
                             + id
                             + ".pdf\""
             )
             .contentType(
                     MediaType.APPLICATION_PDF
             )
             .body(pdf);
 }

    // ============================================================
    // STUDENT - CREATE REQUEST
    // ============================================================

    @PostMapping
    public ResponseEntity<CampusRequestResponse> createRequest(
            @RequestBody CampusRequestCreate request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(requestService.createRequest(request));
    }

    // ============================================================
    // STUDENT - MY REQUESTS
    // ============================================================

    @GetMapping("/my")
    public ResponseEntity<List<CampusRequestResponse>> getMyRequests() {

        return ResponseEntity.ok(
                requestService.getMyRequests()
        );
    }

    // ============================================================
    // GET REQUEST BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<CampusRequestResponse> getRequestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                requestService.getRequestById(id)
        );
    }

    // ============================================================
    // ADMIN - ALL REQUESTS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<CampusRequestResponse>> getAllRequests() {

        return ResponseEntity.ok(
                requestService.getAllRequests()
        );
    }

    // ============================================================
    // ADMIN - UPDATE REQUEST
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<CampusRequestResponse> updateRequest(
            @PathVariable Long id,
            @RequestBody CampusRequestUpdate request) {

        return ResponseEntity.ok(
                requestService.updateRequest(id, request)
        );
    }
}