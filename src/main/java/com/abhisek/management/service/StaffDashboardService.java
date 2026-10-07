package com.abhisek.management.service;

import com.abhisek.management.dto.StaffDashboardResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.ComplaintRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class StaffDashboardService {

    private final ComplaintRepository complaintRepository;
    private final CurrentUserService currentUserService;

    public StaffDashboardService(
            ComplaintRepository complaintRepository,
            CurrentUserService currentUserService) {

        this.complaintRepository = complaintRepository;
        this.currentUserService = currentUserService;
    }

    public StaffDashboardResponse getDashboard() {

        User currentUser = currentUserService.getCurrentUser();

        if (!"STAFF".equals(currentUser.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only staff members can access this dashboard"
            );
        }

        long assigned = complaintRepository
                .countByAssignedStaffAndStatus(
                        currentUser, "ASSIGNED"
                );

        long inProgress = complaintRepository
                .countByAssignedStaffAndStatus(
                        currentUser, "IN_PROGRESS"
                );

        long resolved = complaintRepository
                .countByAssignedStaffAndStatus(
                        currentUser, "RESOLVED"
                );

        long totalAssigned = assigned + inProgress + resolved;

        return new StaffDashboardResponse(
                totalAssigned,
                assigned,
                inProgress,
                resolved
        );
    }
}