
package com.abhisek.management.service;

import com.abhisek.management.dto.WardenDashboardResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.GatePassRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class WardenDashboardService {

    private final GatePassRepository gatePassRepository;
    private final CurrentUserService currentUserService;

    public WardenDashboardService(
            GatePassRepository gatePassRepository,
            CurrentUserService currentUserService) {

        this.gatePassRepository = gatePassRepository;
        this.currentUserService = currentUserService;
    }

    public WardenDashboardResponse getDashboard() {

        User currentUser = currentUserService.getCurrentUser();

        if (!"HOSTEL_WARDEN".equals(currentUser.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only hostel wardens can access this dashboard"
            );
        }

        long pending =
                gatePassRepository.countByStatus("PENDING");

        long approved =
                gatePassRepository.countByStatus("APPROVED");

        long rejected =
                gatePassRepository.countByStatus("REJECTED");

        long currentlyOutside =
                gatePassRepository.countByStatus("OUTSIDE");

        long completed =
                gatePassRepository.countByStatus("COMPLETED");

        long totalRequests =
                gatePassRepository.count();

        return new WardenDashboardResponse(
                totalRequests,
                pending,
                approved,
                rejected,
                currentlyOutside,
                completed
        );
    }
}
