package com.abhisek.management.service;

import com.abhisek.management.dto.StudentDashboardResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.ComplaintRepository;
import com.abhisek.management.repository.CampusRequestRepository;
import com.abhisek.management.repository.GatePassRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class StudentDashboardService {

    private final ComplaintRepository complaintRepository;
    private final CampusRequestRepository campusRequestRepository;
    private final GatePassRepository gatePassRepository;
    private final CurrentUserService currentUserService;

    public StudentDashboardService(
            ComplaintRepository complaintRepository,
            CampusRequestRepository campusRequestRepository,
            GatePassRepository gatePassRepository,
            CurrentUserService currentUserService) {

        this.complaintRepository = complaintRepository;
        this.campusRequestRepository = campusRequestRepository;
        this.gatePassRepository = gatePassRepository;
        this.currentUserService = currentUserService;
    }

    public StudentDashboardResponse getDashboard() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equals(student.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can access this dashboard"
            );
        }

        long totalComplaints =
                complaintRepository.countByUser(student);

        long pendingComplaints =
                complaintRepository.countByUserAndStatus(
                        student, "PENDING"
                );

        long totalCampusRequests =
                campusRequestRepository.countByUser(student);

        long pendingCampusRequests =
                campusRequestRepository.countByUserAndStatus(
                        student, "PENDING"
                );
        long totalGatePasses =
                gatePassRepository.countByStudentAndStatus(
                        student, "PENDING"
                )
                + gatePassRepository.countByStudentAndStatus(
                        student, "APPROVED"
                )
                + gatePassRepository.countByStudentAndStatus(
                        student, "REJECTED"
                )
                + gatePassRepository.countByStudentAndStatus(
                        student, "OUTSIDE"
                )
                + gatePassRepository.countByStudentAndStatus(
                        student, "COMPLETED"
                );

        long pendingGatePasses =
                gatePassRepository.countByStudentAndStatus(
                        student, "PENDING"
                );

        return new StudentDashboardResponse(
                totalComplaints,
                pendingComplaints,
                totalCampusRequests,
                pendingCampusRequests,
                totalGatePasses,
                pendingGatePasses
        );
    }
}