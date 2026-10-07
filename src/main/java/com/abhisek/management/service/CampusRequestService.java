package com.abhisek.management.service;

import com.abhisek.management.dto.CampusRequestCreate;
import com.abhisek.management.dto.CampusRequestResponse;
import com.abhisek.management.dto.CampusRequestUpdate;
import com.abhisek.management.entity.CampusRequest;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.CampusRequestRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CampusRequestService {

    private final CampusRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    
            public CampusRequestService(
                    CampusRequestRepository requestRepository,
                    UserRepository userRepository,
                    CurrentUserService currentUserService,
                    NotificationService notificationService) {

                this.requestRepository = requestRepository;
                this.userRepository = userRepository;
                this.currentUserService = currentUserService;
                this.notificationService = notificationService;
            }

    // ============================================================
    // STUDENT - CREATE REQUEST
    // ============================================================

    public CampusRequestResponse createRequest(
            CampusRequestCreate request) {

        User currentUser = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(currentUser.getRole())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can create campus requests"
            );
        }

        validateCreateRequest(request);

        CampusRequest campusRequest = new CampusRequest();

        campusRequest.setRequestType(
                request.getRequestType()
                        .trim()
                        .toUpperCase()
        );

        campusRequest.setDescription(
                request.getDescription().trim()
        );

        campusRequest.setUser(currentUser);

        CampusRequest saved =
                requestRepository.save(campusRequest);

        // Notify all admins
        List<User> admins = userRepository.findByRole("ADMIN");

        for (User admin : admins) {
            notificationService.createNotification(
                    admin,
                    "New Campus Request",
                    "A new campus request has been submitted by "
                            + currentUser.getEmail()
                            + ". Request ID: "
                            + saved.getId(),
                    "CAMPUS_REQUEST"
            );
        }

        return new CampusRequestResponse(saved);
    }

    // ============================================================
    // STUDENT - GET MY REQUESTS
    // ============================================================

    public List<CampusRequestResponse> getMyRequests() {

        User currentUser = currentUserService.getCurrentUser();

        return requestRepository
                .findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(CampusRequestResponse::new)
                .toList();
    }

    // ============================================================
    // GET REQUEST BY ID
    // ============================================================

    public CampusRequestResponse getRequestById(Long id) {

        CampusRequest request =
                requestRepository.findById(id)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Campus request not found"
                        ));

        User currentUser =
                currentUserService.getCurrentUser();

        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return new CampusRequestResponse(request);
        }

        if ("STUDENT".equalsIgnoreCase(currentUser.getRole())) {

            if (request.getUser() == null ||
                    !request.getUser()
                            .getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this request"
                );
            }

            return new CampusRequestResponse(request);
        }

        throw new ApiException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to view this request"
        );
    }

    // ============================================================
    // ADMIN - GET ALL REQUESTS
    // ============================================================

    public List<CampusRequestResponse> getAllRequests() {

        return requestRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(CampusRequestResponse::new)
                .toList();
    }

    // ============================================================
    // ADMIN - UPDATE REQUEST
    // ============================================================

    public CampusRequestResponse updateRequest(
            Long id,
            CampusRequestUpdate request) {

        CampusRequest campusRequest =
                requestRepository.findById(id)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Campus request not found"
                        ));

        validateStatus(request.getStatus());

        campusRequest.setStatus(
                request.getStatus()
                        .trim()
                        .toUpperCase()
        );

        if (request.getAdminRemarks() != null &&
                !request.getAdminRemarks().isBlank()) {

            campusRequest.setAdminRemarks(
                    request.getAdminRemarks().trim()
            );
        }

        if ("COMPLETED".equals(campusRequest.getStatus())) {

            campusRequest.setCompletedAt(
                    LocalDateTime.now()
            );
        }

        CampusRequest updated =
                requestRepository.save(campusRequest);

        // Notify the student
        if (campusRequest.getUser() != null) {

            notificationService.createNotification(
                    campusRequest.getUser(),
                    "Campus Request Status Updated",
                    "Your campus request #"
                            + updated.getId()
                            + " status has been changed to "
                            + updated.getStatus() + ".",
                    "CAMPUS_REQUEST"
            );
        }

        return new CampusRequestResponse(updated);
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    private void validateCreateRequest(
            CampusRequestCreate request) {

        if (request == null) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Request body cannot be empty"
            );
        }

        if (request.getRequestType() == null ||
                request.getRequestType().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Request type is required"
            );
        }

        if (request.getDescription() == null ||
                request.getDescription().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Description is required"
            );
        }
    }

    private void validateStatus(String status) {

        List<String> validStatuses = List.of(
                "PENDING",
                "UNDER_REVIEW",
                "APPROVED",
                "REJECTED",
                "COMPLETED"
        );

        if (status == null ||
                !validStatuses.contains(
                        status.trim().toUpperCase()
                )) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be one of " + validStatuses
            );
        }
    }
}