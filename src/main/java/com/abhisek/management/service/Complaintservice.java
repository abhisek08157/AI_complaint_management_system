package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;
import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.dto.DashboardResponse;
import com.abhisek.management.dto.DuplicateAnalysisResult;
import com.abhisek.management.dto.RecurringAnalysisResult;
import com.abhisek.management.dto.StatusUpdateRequest;
import com.abhisek.management.dto.UserResponse;
import com.abhisek.management.entity.Complaint;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.ComplaintRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class Complaintservice {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AiService aiService;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public Complaintservice(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            AiService aiService,
            CurrentUserService currentUserService,
            NotificationService notificationService) {

        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    // ============================================================
    // CREATE COMPLAINT
    // ============================================================

    public ComplaintResponse createComplaint(
            Long userId,
            ComplaintRequest request) {

        validateComplaintRequest(request);

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can create complaints"
            );
        }

        // ========================================================
        // CREATE COMPLAINT FIRST
        // ========================================================

        Complaint complaint = new Complaint();

        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setLocation(request.getLocation().trim());
        complaint.setUser(student);

        // Temporary values before AI analysis
        complaint.setCategory("OTHER");
        complaint.setPriority("MEDIUM");
        complaint.setSummary(
                "Complaint submitted. AI analysis is being processed."
        );

        Complaint saved = complaintRepository.save(complaint);

        // ========================================================
        // AI COMPLAINT ANALYSIS
        // ========================================================

        try {

            AiAnalysisResult analysis =
                    aiService.analyzeComplaint(
                            saved.getId(),
                            saved.getTitle(),
                            saved.getDescription(),
                            saved.getLocation()
                    );

            if (analysis != null) {

                if (analysis.getCategory() != null) {
                    saved.setCategory(
                            analysis.getCategory()
                    );
                }

                if (analysis.getPriority() != null) {
                    saved.setPriority(
                            analysis.getPriority()
                    );
                }

                if (analysis.getSummary() != null) {
                    saved.setSummary(
                            analysis.getSummary()
                    );
                }
            }

        } catch (Exception e) {

            System.out.println(
                    "Complaint AI analysis failed: "
                            + e.getMessage()
            );
        }

        // ========================================================
        // AI DUPLICATE + RECURRING ANALYSIS
        // ========================================================

        try {

            /*
             * Store the ID in a separate final/effectively-final
             * variable.
             *
             * This fixes the lambda error:
             * !c.getId().equals(saved.getId())
             */
            Long savedComplaintId = saved.getId();

            List<Complaint> historicalComplaints =
                    complaintRepository
                            .findAllByOrderByCreatedAtDesc()
                            .stream()
                            .filter(c ->
                                    !c.getId()
                                            .equals(savedComplaintId)
                            )
                            .limit(20)
                            .toList();

            // ----------------------------------------------------
            // DUPLICATE ANALYSIS
            // ----------------------------------------------------

            if (!historicalComplaints.isEmpty()) {

                try {

                    DuplicateAnalysisResult duplicateResult =
                            aiService.analyzeDuplicate(
                                    saved,
                                    historicalComplaints
                            );

                    if (duplicateResult != null) {

                        saved.setPossibleDuplicate(
                                duplicateResult.isPossibleDuplicate()
                        );

                        saved.setMatchedComplaintId(
                                duplicateResult.getMatchedComplaintId()
                        );

                        saved.setDuplicateReason(
                                duplicateResult.getSimilarityReason()
                        );
                    }

                } catch (Exception e) {

                    System.out.println(
                            "Duplicate AI analysis failed: "
                                    + e.getMessage()
                    );
                }

                // ------------------------------------------------
                // RECURRING ANALYSIS
                // ------------------------------------------------

                try {

                    RecurringAnalysisResult recurringResult =
                            aiService.analyzeRecurring(
                                    saved,
                                    historicalComplaints
                            );

                    if (recurringResult != null) {

                        saved.setPossibleRecurringIssue(
                                recurringResult
                                        .isPossibleRecurringIssue()
                        );

                        saved.setRecurringReason(
                                recurringResult.getReason()
                        );
                    }

                } catch (Exception e) {

                    System.out.println(
                            "Recurring AI analysis failed: "
                                    + e.getMessage()
                    );
                }

                // Save AI results
                saved = complaintRepository.save(saved);
            }

        } catch (Exception e) {

            System.out.println(
                    "Historical complaint AI analysis failed: "
                            + e.getMessage()
            );
        }

        // ========================================================
        // NOTIFY ADMINS
        // ========================================================

        try {

            List<User> admins =
                    userRepository.findByRole("ADMIN");

            for (User admin : admins) {

                notificationService.createNotification(
                        admin,
                        "New Complaint Submitted",
                        "A new complaint #" + saved.getId()
                                + " has been submitted.",
                        "COMPLAINT"
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "Complaint notification failed: "
                            + e.getMessage()
            );
        }

        return new ComplaintResponse(saved);
    }

    // ============================================================
    // MANUAL RECURRING ANALYSIS
    // ============================================================

    public RecurringAnalysisResult analyzeRecurringIssue(
            Long complaintId) {

        Complaint currentComplaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        List<Complaint> historicalComplaints =
                complaintRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .filter(c ->
                                !c.getId().equals(complaintId)
                        )
                        .toList();

        return aiService.analyzeRecurring(
                currentComplaint,
                historicalComplaints
        );
    }

    // ============================================================
    // MANUAL DUPLICATE ANALYSIS
    // ============================================================

    public DuplicateAnalysisResult analyzeDuplicateComplaint(
            Long complaintId) {

        Complaint currentComplaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        List<Complaint> historicalComplaints =
                complaintRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .filter(c ->
                                !c.getId().equals(complaintId)
                        )
                        .toList();

        return aiService.analyzeDuplicate(
                currentComplaint,
                historicalComplaints
        );
    }

    // ============================================================
    // GET ALL COMPLAINTS
    // ADMIN ONLY
    // ============================================================

    public List<ComplaintResponse> getAllComplaints() {

        return complaintRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    // ============================================================
    // GET COMPLAINT BY ID
    // ============================================================

    public ComplaintResponse getComplaintById(Long id) {

        Complaint complaint =
                complaintRepository.findById(id)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        User currentUser =
                currentUserService.getCurrentUser();

        // ADMIN can view every complaint
        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return new ComplaintResponse(complaint);
        }

        // STUDENT can view only their own complaint
        if ("STUDENT".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getUser() == null ||
                    !complaint.getUser()
                            .getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this complaint"
                );
            }

            return new ComplaintResponse(complaint);
        }

        // STAFF can view only assigned complaints
        if ("STAFF".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getAssignedStaff() == null ||
                    !complaint.getAssignedStaff()
                            .getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not assigned to this complaint"
                );
            }

            return new ComplaintResponse(complaint);
        }

        throw new ApiException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to view this complaint"
        );
    }

    // ============================================================
    // GET CURRENT USER'S COMPLAINTS
    // ============================================================

    public List<ComplaintResponse> getComplaintsByUser(
            Long userId) {

        User currentUser =
                currentUserService.getCurrentUser();

        // Prevent one student from requesting another
        // student's complaints
        if ("STUDENT".equalsIgnoreCase(currentUser.getRole())
                && !currentUser.getId().equals(userId)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only view your own complaints"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "User not found"
                ));

        return complaintRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    // ============================================================
    // ADMIN - ASSIGN STAFF
    // ============================================================

    public ComplaintResponse assignStaff(
            Long complaintId,
            Long staffId) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        User staff =
                userRepository.findById(staffId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Staff not found"
                        ));

        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Selected user is not a staff member"
            );
        }

        complaint.setAssignedStaff(staff);
        complaint.setStatus("ASSIGNED");

        Complaint saved =
                complaintRepository.save(complaint);

        // Notify assigned staff
        notificationService.createNotification(
                staff,
                "Complaint Assigned",
                "Complaint #" + saved.getId()
                        + " has been assigned to you.",
                "COMPLAINT"
        );

        // Notify student
        if (complaint.getUser() != null) {

            notificationService.createNotification(
                    complaint.getUser(),
                    "Complaint Assigned",
                    "Your complaint #" + saved.getId()
                            + " has been assigned to "
                            + staff.getEmail() + ".",
                    "COMPLAINT"
            );
        }

        return new ComplaintResponse(saved);
    }

    // ============================================================
    // ADMIN - GET STAFF LIST
    // ============================================================

    public List<UserResponse> getStaffList() {

        return userRepository
                .findByRole("STAFF")
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    // ============================================================
    // ADMIN - UPDATE STAFF SPECIALIZATION
    // ============================================================

    public UserResponse updateStaffSpecialization(
            Long staffId,
            String specialization) {

        User staff =
                userRepository.findById(staffId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Staff member not found"
                        ));

        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "User is not a staff member"
            );
        }

        if (specialization == null ||
                specialization.isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Specialization cannot be empty"
            );
        }

        staff.setSpecialization(
                specialization.trim()
        );

        User updatedStaff =
                userRepository.save(staff);

        return new UserResponse(updatedStaff);
    }

    // ============================================================
    // ADMIN DASHBOARD
    // ============================================================

    public DashboardResponse getDashboardStats() {

        long total =
                complaintRepository.count();

        long submitted =
                complaintRepository.countByStatus("SUBMITTED");

        long assigned =
                complaintRepository.countByStatus("ASSIGNED");

        long inProgress =
                complaintRepository.countByStatus("IN_PROGRESS");

        long resolved =
                complaintRepository.countByStatus("RESOLVED");

        return new DashboardResponse(
                total,
                submitted,
                assigned,
                inProgress,
                resolved
        );
    }

    // ============================================================
    // STAFF - GET ASSIGNED COMPLAINTS
    // ============================================================

    public List<ComplaintResponse> getComplaintsByStaff(
            Long staffId) {

        User currentUser =
                currentUserService.getCurrentUser();

        // STAFF can only request their own assigned complaints
        if ("STAFF".equalsIgnoreCase(currentUser.getRole())
                && !currentUser.getId().equals(staffId)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only view complaints assigned to you"
            );
        }

        User staff =
                userRepository.findById(staffId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Staff not found"
                        ));

        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "User is not a staff member"
            );
        }

        return complaintRepository
                .findByAssignedStaffOrderByCreatedAtDesc(staff)
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    // ============================================================
    // STAFF - UPDATE COMPLAINT STATUS
    // ============================================================

    public ComplaintResponse updateStatus(
            Long complaintId,
            StatusUpdateRequest request) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        User currentUser =
                currentUserService.getCurrentUser();

        // Verify assigned staff
        if ("STAFF".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getAssignedStaff() == null ||
                    !complaint.getAssignedStaff()
                            .getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not assigned to this complaint"
                );
            }
        }

        String newStatus =
                request.getStatus();

        List<String> validStatuses =
                List.of(
                        "ASSIGNED",
                        "IN_PROGRESS",
                        "RESOLVED"
                );

        if (newStatus == null ||
                !validStatuses.contains(newStatus)) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be one of "
                            + validStatuses
            );
        }

        complaint.setStatus(newStatus);

        if (request.getResolution() != null &&
                !request.getResolution().isBlank()) {

            complaint.setResolution(
                    request.getResolution().trim()
            );
        }

        if ("RESOLVED".equals(newStatus)) {

            complaint.setResolvedAt(
                    LocalDateTime.now()
            );
        }

        Complaint saved =
                complaintRepository.save(complaint);

        // Notify student when complaint status changes
        if (complaint.getUser() != null) {

            String notificationTitle =
                    "Complaint Status Updated";

            String notificationMessage =
                    "Your complaint #" + saved.getId()
                            + " status has been changed to "
                            + newStatus + ".";

            if ("RESOLVED".equals(newStatus)) {

                notificationTitle =
                        "Complaint Resolved";

                notificationMessage =
                        "Your complaint #"
                                + saved.getId()
                                + " has been resolved.";
            }

            notificationService.createNotification(
                    complaint.getUser(),
                    notificationTitle,
                    notificationMessage,
                    "COMPLAINT"
            );
        }

        return new ComplaintResponse(saved);
    }
 // ============================================================
 // STUDENT - CONFIRM COMPLAINT RESOLUTION
 // ============================================================

 public ComplaintResponse confirmResolution(
         Long complaintId,
         boolean confirmed) {

     Complaint complaint =
             complaintRepository.findById(complaintId)
                     .orElseThrow(() -> new ApiException(
                             HttpStatus.NOT_FOUND,
                             "Complaint not found"
                     ));

     User currentUser =
             currentUserService.getCurrentUser();

     // Only students can confirm resolution
     if (!"STUDENT".equalsIgnoreCase(currentUser.getRole())) {

         throw new ApiException(
                 HttpStatus.FORBIDDEN,
                 "Only students can confirm complaint resolution"
         );
     }

     // Student can confirm only their own complaint
     if (complaint.getUser() == null ||
             !complaint.getUser()
                     .getId()
                     .equals(currentUser.getId())) {

         throw new ApiException(
                 HttpStatus.FORBIDDEN,
                 "You can only confirm your own complaint"
         );
     }

     // Complaint must be resolved by staff first
     if (!"RESOLVED".equalsIgnoreCase(
             complaint.getStatus())) {

         throw new ApiException(
                 HttpStatus.BAD_REQUEST,
                 "Only resolved complaints can be confirmed"
         );
     }

     if (confirmed) {

         // Student accepts the resolution
         complaint.setStudentConfirmed(true);
         complaint.setConfirmedAt(LocalDateTime.now());
         complaint.setStatus("CLOSED");

     } else {

         // Student says issue is still not resolved
         complaint.setStudentConfirmed(false);
         complaint.setConfirmedAt(null);
         complaint.setStatus("IN_PROGRESS");
     }

     Complaint saved =
             complaintRepository.save(complaint);

     // Notify assigned staff
     if (complaint.getAssignedStaff() != null) {

         String title;
         String message;

         if (confirmed) {

             title = "Complaint Closed";

             message =
                     "Student has confirmed that complaint #"
                             + saved.getId()
                             + " has been resolved.";

         } else {

             title = "Complaint Reopened";

             message =
                     "Student has reported that complaint #"
                             + saved.getId()
                             + " is still not resolved.";
         }

         notificationService.createNotification(
                 complaint.getAssignedStaff(),
                 title,
                 message,
                 "COMPLAINT"
         );
     }

     return new ComplaintResponse(saved);
 }


    // ============================================================
    // STUDENT - UPLOAD COMPLAINT PHOTO
    // ============================================================

    public void uploadComplaintPhoto(
            Long complaintId,
            MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Please select an image"
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Image size must not exceed 5 MB"
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.equalsIgnoreCase("image/jpeg")
                        || contentType.equalsIgnoreCase("image/png")
                        || contentType.equalsIgnoreCase("image/webp"))) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        User currentUser =
                currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(currentUser.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can upload complaint photos"
            );
        }

        if (complaint.getUser() == null ||
                !complaint.getUser().getId()
                        .equals(currentUser.getId())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only upload a photo to your own complaint"
            );
        }

        try {
            complaint.setPhoto(file.getBytes());
            complaint.setPhotoName(file.getOriginalFilename());
            complaint.setPhotoContentType(contentType);

            complaintRepository.save(complaint);

        } catch (IOException e) {
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload complaint photo"
            );
        }
    }


    // ============================================================
    // VIEW COMPLAINT PHOTO
    // ADMIN / OWNER STUDENT / ASSIGNED STAFF
    // ============================================================

    public Complaint getComplaintPhoto(Long complaintId) {

        Complaint complaint =
                complaintRepository.findById(complaintId)
                        .orElseThrow(() -> new ApiException(
                                HttpStatus.NOT_FOUND,
                                "Complaint not found"
                        ));

        User currentUser =
                currentUserService.getCurrentUser();

        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return complaint;
        }

        if ("STUDENT".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getUser() == null ||
                    !complaint.getUser().getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this complaint photo"
                );
            }

            return complaint;
        }

        if ("STAFF".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getAssignedStaff() == null ||
                    !complaint.getAssignedStaff().getId()
                            .equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not assigned to this complaint"
                );
            }

            return complaint;
        }

        throw new ApiException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to view this complaint photo"
        );
    }


    // ============================================================
    // VALIDATE COMPLAINT REQUEST
    // ============================================================

    private void validateComplaintRequest(
            ComplaintRequest request) {

        if (request == null) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Complaint request cannot be empty"
            );
        }

        if (request.getTitle() == null ||
                request.getTitle().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Title is required"
            );
        }

        if (request.getDescription() == null ||
                request.getDescription().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Description is required"
            );
        }

        if (request.getLocation() == null ||
                request.getLocation().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Location is required"
            );
        }
    }
}