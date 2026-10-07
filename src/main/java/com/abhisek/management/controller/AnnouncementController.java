package com.abhisek.management.controller;

import com.abhisek.management.dto.AnnouncementCreateRequest;
import com.abhisek.management.dto.AnnouncementResponse;
import com.abhisek.management.dto.AnnouncementUpdateRequest;
import com.abhisek.management.service.AnnouncementService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(
            AnnouncementService announcementService) {

        this.announcementService = announcementService;
    }

    // =========================
    // CREATE
    // =========================

    @PostMapping
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @RequestBody AnnouncementCreateRequest request) {

        AnnouncementResponse response =
                announcementService.createAnnouncement(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================
    // GET PUBLISHED
    // =========================

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>>
    getPublishedAnnouncements() {

        return ResponseEntity.ok(
                announcementService.getPublishedAnnouncements()
        );
    }

    // =========================
    // GET BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementResponse>
    getAnnouncementById(@PathVariable Long id) {

        return ResponseEntity.ok(
                announcementService.getAnnouncementById(id)
        );
    }

    // =========================
    // GET MY ANNOUNCEMENTS
    // =========================

    @GetMapping("/my")
    public ResponseEntity<List<AnnouncementResponse>>
    getMyAnnouncements() {

        return ResponseEntity.ok(
                announcementService.getMyAnnouncements()
        );
    }

    // =========================
    // ADMIN - GET ALL
    // =========================

    @GetMapping("/admin")
    public ResponseEntity<List<AnnouncementResponse>>
    getAllAnnouncements() {

        return ResponseEntity.ok(
                announcementService.getAllAnnouncements()
        );
    }

    // =========================
    // UPDATE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementResponse>
    updateAnnouncement(
            @PathVariable Long id,
            @RequestBody AnnouncementUpdateRequest request) {

        return ResponseEntity.ok(
                announcementService.updateAnnouncement(id, request)
        );
    }

    // =========================
    // DELETE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteAnnouncement(@PathVariable Long id) {

        announcementService.deleteAnnouncement(id);

        return ResponseEntity.noContent().build();
    }
}