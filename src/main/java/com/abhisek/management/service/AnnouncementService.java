package com.abhisek.management.service;

import com.abhisek.management.dto.AnnouncementCreateRequest;
import com.abhisek.management.dto.AnnouncementResponse;
import com.abhisek.management.dto.AnnouncementUpdateRequest;
import com.abhisek.management.entity.Announcement;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.AnnouncementRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CurrentUserService currentUserService;

    public AnnouncementService(
            AnnouncementRepository announcementRepository,
            CurrentUserService currentUserService) {

        this.announcementRepository = announcementRepository;
        this.currentUserService = currentUserService;
    }

    // =========================
    // CREATE ANNOUNCEMENT
    // =========================

    public AnnouncementResponse createAnnouncement(
            AnnouncementCreateRequest request) {

        User currentUser = currentUserService.getCurrentUser();

        validateCreatorRole(currentUser);

        validateCreateRequest(request);

        Announcement announcement = new Announcement();

        announcement.setTitle(request.getTitle().trim());
        announcement.setContent(request.getContent().trim());
        announcement.setCategory(request.getCategory().trim().toUpperCase());
        announcement.setTargetAudience(
                request.getTargetAudience().trim().toUpperCase()
        );

        String status = request.getStatus();

        if (status == null || status.isBlank()) {
            status = "PUBLISHED";
        }

        status = status.trim().toUpperCase();

        validateStatus(status);

        announcement.setStatus(status);
        announcement.setPublishAt(request.getPublishAt());
        announcement.setExpiresAt(request.getExpiresAt());
        announcement.setCreatedBy(currentUser);

        validateDates(announcement);
        if ("PUBLISHED".equals(status)
                && announcement.getPublishAt() != null
                && !announcement.getPublishAt().isAfter(LocalDateTime.now())) {

            announcement.setNotificationSent(false);
        }

        Announcement saved = announcementRepository.save(announcement);

        return new AnnouncementResponse(saved);
    }

    // =========================
    // GET ALL PUBLISHED
    // =========================

    public List<AnnouncementResponse> getPublishedAnnouncements() {

    	
    	    User currentUser = currentUserService.getCurrentUser();

    	    List<Announcement> announcements =
    	            announcementRepository
    	                    .findByStatusOrderByCreatedAtDesc("PUBLISHED");

    	    return announcements.stream()
    	            .filter(this::isVisible)
    	            .filter(announcement -> isAudienceAllowed(
    	                    announcement,
    	                    currentUser
    	            ))
    	            .map(AnnouncementResponse::new)
    	            .toList();
    	}
    

    // =========================
    // GET ALL
    // ADMIN
    // =========================

    public List<AnnouncementResponse> getAllAnnouncements() {

        User currentUser = currentUserService.getCurrentUser();

        if (!isAdmin(currentUser)) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admin can view all announcements"
            );
        }

        return announcementRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(AnnouncementResponse::new)
                .toList();
    }

    // =========================
    // GET MY ANNOUNCEMENTS
    // =========================

    public List<AnnouncementResponse> getMyAnnouncements() {

        User currentUser = currentUserService.getCurrentUser();

        return announcementRepository
                .findByCreatedByOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(AnnouncementResponse::new)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================

    public AnnouncementResponse getAnnouncementById(Long id) {

        User currentUser = currentUserService.getCurrentUser();

        Announcement announcement = announcementRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        /*
         * Admin can view everything.
         * Creators can view their own announcements.
         * Other users can view only published announcements
         * that are currently visible to them.
         */
        if (isAdmin(currentUser)) {
            return new AnnouncementResponse(announcement);
        }

        if (announcement.getCreatedBy().getId().equals(currentUser.getId())) {
            return new AnnouncementResponse(announcement);
        }

        if (!"PUBLISHED".equals(announcement.getStatus())
                || !isVisible(announcement)
                || !isAudienceAllowed(announcement, currentUser)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this announcement"
            );
        
        }

        return new AnnouncementResponse(announcement);
    }

    // =========================
    // UPDATE
    // =========================

    public AnnouncementResponse updateAnnouncement(
            Long id,
            AnnouncementUpdateRequest request) {

        User currentUser = currentUserService.getCurrentUser();

        Announcement announcement = announcementRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        validateModificationPermission(currentUser, announcement);

        if (request.getTitle() != null
                && !request.getTitle().isBlank()) {

            announcement.setTitle(request.getTitle().trim());
        }

        if (request.getContent() != null
                && !request.getContent().isBlank()) {

            announcement.setContent(request.getContent().trim());
        }

        if (request.getCategory() != null
                && !request.getCategory().isBlank()) {

            announcement.setCategory(
                    request.getCategory().trim().toUpperCase()
            );
        }

        if (request.getTargetAudience() != null
                && !request.getTargetAudience().isBlank()) {

            announcement.setTargetAudience(
                    request.getTargetAudience().trim().toUpperCase()
            );
        }

        if (request.getStatus() != null
                && !request.getStatus().isBlank()) {

            String status =
                    request.getStatus().trim().toUpperCase();

            validateStatus(status);

            announcement.setStatus(status);

            if ("PUBLISHED".equals(status)
                    && announcement.getPublishAt() == null) {

                announcement.setPublishAt(LocalDateTime.now());
            }
        }

        if (request.getPublishAt() != null) {
            announcement.setPublishAt(request.getPublishAt());
        }

        if (request.getExpiresAt() != null) {
            announcement.setExpiresAt(request.getExpiresAt());
        }

        validateDates(announcement);

        Announcement updated =
                announcementRepository.save(announcement);

        return new AnnouncementResponse(updated);
    }

    // =========================
    // DELETE
    // =========================

    public void deleteAnnouncement(Long id) {

        User currentUser = currentUserService.getCurrentUser();

        Announcement announcement = announcementRepository
                .findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Announcement not found"
                ));

        validateModificationPermission(currentUser, announcement);

        announcementRepository.delete(announcement);
    }

    // =========================
    // VALIDATIONS
    // =========================

    private void validateCreatorRole(User user) {

        String role = user.getRole();

        if (!"ADMIN".equals(role)
                && !"STAFF".equals(role)
                && !"HOSTEL_WARDEN".equals(role)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Your role is not allowed to create announcements"
            );
        }
    }

    private void validateModificationPermission(
            User currentUser,
            Announcement announcement) {

        if (isAdmin(currentUser)) {
            return;
        }

        boolean isCreator =
                announcement.getCreatedBy()
                        .getId()
                        .equals(currentUser.getId());

        if (!isCreator) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only modify your own announcements"
            );
        }

        validateCreatorRole(currentUser);
    }

    private boolean isAdmin(User user) {
        return "ADMIN".equals(user.getRole());
    }

    private void validateCreateRequest(
            AnnouncementCreateRequest request) {

        if (request.getTitle() == null
                || request.getTitle().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement title is required"
            );
        }

        if (request.getContent() == null
                || request.getContent().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement content is required"
            );
        }

        if (request.getCategory() == null
                || request.getCategory().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Announcement category is required"
            );
        }

        if (request.getTargetAudience() == null
                || request.getTargetAudience().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Target audience is required"
            );
        }

        validateTargetAudience(
                request.getTargetAudience().trim().toUpperCase()
        );
    }

    private void validateTargetAudience(String targetAudience) {

        if (!targetAudience.equals("ALL")
                && !targetAudience.equals("STUDENT")
                && !targetAudience.equals("STAFF")
                && !targetAudience.equals("HOSTEL")) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid target audience"
            );
        }
    }

    private void validateStatus(String status) {

        if (!status.equals("DRAFT")
                && !status.equals("PUBLISHED")
                && !status.equals("EXPIRED")) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid announcement status"
            );
        }
    }

    private void validateDates(Announcement announcement) {

        LocalDateTime publishAt =
                announcement.getPublishAt();

        LocalDateTime expiresAt =
                announcement.getExpiresAt();

        if (publishAt != null
                && expiresAt != null
                && !expiresAt.isAfter(publishAt)) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Expiry time must be after publish time"
            );
        }
    }
    

    // =========================
    // VISIBILITY
    // =========================

    private boolean isVisible(Announcement announcement) {

        LocalDateTime now = LocalDateTime.now();

        if (!"PUBLISHED".equals(announcement.getStatus())) {
            return false;
        }

        if (announcement.getPublishAt() != null
                && now.isBefore(announcement.getPublishAt())) {

            return false;
        }

        if (announcement.getExpiresAt() != null
                && now.isAfter(announcement.getExpiresAt())) {

            return false;
        }

        return true;
    }
    private boolean isAudienceAllowed(
            Announcement announcement,
            User currentUser) {

        String audience = announcement.getTargetAudience();
        String role = currentUser.getRole();

        if ("ALL".equals(audience)) {
            return true;
        }

        if ("STUDENT".equals(audience)) {
            return "STUDENT".equals(role)
                    || "ADMIN".equals(role);
        }

        if ("STAFF".equals(audience)) {
            return "STAFF".equals(role)
                    || "ADMIN".equals(role);
        }

        if ("HOSTEL".equals(audience)) {
            return "STUDENT".equals(role)
                    || "HOSTEL_WARDEN".equals(role)
                    || "ADMIN".equals(role);
        }

        return false;
    }
}