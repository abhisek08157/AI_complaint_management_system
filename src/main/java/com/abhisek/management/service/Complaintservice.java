package com.abhisek.management.service;

import com.abhisek.management.dto.AiAnalysisResult;
import com.abhisek.management.dto.ComplaintRequest;
import com.abhisek.management.dto.ComplaintResponse;
import com.abhisek.management.dto.DashboardResponse;
import com.abhisek.management.dto.UserResponse;
import com.abhisek.management.entity.Complaint;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.ComplaintRepository;
import com.abhisek.management.repository.UserRepository;
import com.abhisek.management.dto.StatusUpdateRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Complaintservice {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public Complaintservice(ComplaintRepository complaintRepository,
                             UserRepository userRepository,
                             AiService aiService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.aiService = aiService;
    }

    public ComplaintResponse createComplaint(Long userId, ComplaintRequest request) {

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Description is required");
        }
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Location is required");
        }

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        AiAnalysisResult analysis = aiService.analyzeComplaint(request.getTitle(), request.getDescription());

        Complaint complaint = new Complaint();
        complaint.setTitle(request.getTitle());
        complaint.setDescription(request.getDescription());
        complaint.setLocation(request.getLocation());
        complaint.setUser(student);
        complaint.setCategory(analysis.getCategory());
        complaint.setPriority(analysis.getPriority());
        complaint.setSummary(analysis.getSummary());

        Complaint saved = complaintRepository.save(complaint);

        return new ComplaintResponse(saved);
    }

    public List<ComplaintResponse> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    public ComplaintResponse getComplaintById(Long id) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found"));
        return new ComplaintResponse(complaint);
    }

    public List<ComplaintResponse> getComplaintsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return complaintRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    // --- new: admin assigns a complaint to a staff member ---
    public ComplaintResponse assignStaff(Long complaintId, Long staffId) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found"));

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found"));

        if (!"STAFF".equals(staff.getRole())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Selected user is not a staff member");
        }

        complaint.setAssignedStaff(staff);
        complaint.setStatus("ASSIGNED");

        Complaint saved = complaintRepository.save(complaint);
        return new ComplaintResponse(saved);
    }

    // --- new: list all staff members (for admin to pick from) ---
    public List<UserResponse> getStaffList() {
        return userRepository.findByRole("STAFF")
                .stream()
                .map(UserResponse::new)
                .toList();
    }

    // --- new: dashboard counts ---
    public DashboardResponse getDashboardStats() {
        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus("SUBMITTED");
        long assigned = complaintRepository.countByStatus("ASSIGNED");
        long inProgress = complaintRepository.countByStatus("IN_PROGRESS");
        long resolved = complaintRepository.countByStatus("RESOLVED");
        return new DashboardResponse(total, submitted, assigned, inProgress, resolved);
    }
    
 // --- new: complaints assigned to a specific staff member ---
    public List<ComplaintResponse> getComplaintsByStaff(Long staffId) {
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff not found"));
        return complaintRepository.findByAssignedStaffOrderByCreatedAtDesc(staff)
                .stream()
                .map(ComplaintResponse::new)
                .toList();
    }

    // --- new: staff updates status (and optionally adds a resolution note) ---
    public ComplaintResponse updateStatus(Long complaintId, StatusUpdateRequest request) {

        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Complaint not found"));

        String newStatus = request.getStatus();
        List<String> validStatuses = List.of("ASSIGNED", "IN_PROGRESS", "RESOLVED");

        if (newStatus == null || !validStatuses.contains(newStatus)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Status must be one of " + validStatuses);
        }

        complaint.setStatus(newStatus);

        if (request.getResolution() != null && !request.getResolution().isBlank()) {
            complaint.setResolution(request.getResolution());
        }

        if ("RESOLVED".equals(newStatus)) {
            complaint.setResolvedAt(java.time.LocalDateTime.now());
        }

        Complaint saved = complaintRepository.save(complaint);
        return new ComplaintResponse(saved);
    }
}