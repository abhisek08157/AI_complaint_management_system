package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;
import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.dto.DashboardResponse;
import com.abhisek.management.dto.StatusUpdateRequest;
import com.abhisek.management.dto.UserResponse;
import com.abhisek.management.entity.Complaint;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.ComplaintRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

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

        /*
         * AI analysis
         */
        AiAnalysisResult analysis =
                aiService.analyzeComplaint(
                        request.getTitle(),
                        request.getDescription()
                );

        Complaint complaint = new Complaint();

        complaint.setTitle(request.getTitle().trim());
        complaint.setDescription(request.getDescription().trim());
        complaint.setLocation(request.getLocation().trim());
        complaint.setUser(student);

        complaint.setCategory(analysis.getCategory());
        complaint.setPriority(analysis.getPriority());
        complaint.setSummary(analysis.getSummary());

        Complaint saved = complaintRepository.save(complaint);

     // Notify all admins about the new complaint
     List<User> admins = userRepository.findByRole("ADMIN");

     for (User admin : admins) {
         notificationService.createNotification(
                 admin,
                 "New Complaint Submitted",
                 "A new complaint has been submitted by "
                         + student.getEmail()
                         + ". Complaint ID: "
                         + saved.getId(),
                 "COMPLAINT"
         );
     }

     return new ComplaintResponse(saved);
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

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"
                ));

        User currentUser = currentUserService.getCurrentUser();

        /*
         * ADMIN can view every complaint.
         */
        if ("ADMIN".equalsIgnoreCase(currentUser.getRole())) {
            return new ComplaintResponse(complaint);
        }

        /*
         * STUDENT can view only their own complaint.
         */
        if ("STUDENT".equalsIgnoreCase(currentUser.getRole())) {

            if (complaint.getUser() == null ||
                    !complaint.getUser().getId().equals(currentUser.getId())) {

                throw new ApiException(
                        HttpStatus.FORBIDDEN,
                        "You are not allowed to view this complaint"
                );
            }

            return new ComplaintResponse(complaint);
        }

        /*
         * STAFF can view only complaints assigned to them.
         */
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

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {

        User currentUser = currentUserService.getCurrentUser();

        /*
         * Prevent one student from requesting another student's
         * complaints by changing the userId in the request.
         */
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

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"
                ));

        User staff = userRepository.findById(staffId)
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

        Complaint saved = complaintRepository.save(complaint);

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

        return userRepository.findByRole("STAFF")
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

        User staff = userRepository.findById(staffId)
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

        staff.setSpecialization(specialization.trim());

        User updatedStaff = userRepository.save(staff);

        return new UserResponse(updatedStaff);
    }

    // ============================================================
    // ADMIN DASHBOARD
    // ============================================================

    public DashboardResponse getDashboardStats() {

        long total = complaintRepository.count();

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

        User currentUser = currentUserService.getCurrentUser();

        /*
         * STAFF can only request their own assigned complaints.
         */
        if ("STAFF".equalsIgnoreCase(currentUser.getRole())
                && !currentUser.getId().equals(staffId)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only view complaints assigned to you"
            );
        }

        User staff = userRepository.findById(staffId)
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

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"
                ));

        User currentUser = currentUserService.getCurrentUser();

        /*
         * Verify that the current staff member is actually
         * assigned to this complaint.
         */
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

        String newStatus = request.getStatus();

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
                    "Status must be one of " + validStatuses
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

            String notificationTitle = "Complaint Status Updated";

            String notificationMessage =
                    "Your complaint #" + saved.getId()
                            + " status has been changed to "
                            + newStatus + ".";

            if ("RESOLVED".equals(newStatus)) {
                notificationTitle = "Complaint Resolved";
                notificationMessage =
                        "Your complaint #" + saved.getId()
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