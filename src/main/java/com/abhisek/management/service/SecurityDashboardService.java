package com.abhisek.management.service;

import com.abhisek.management.dto.SecurityDashboardResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.GatePassLogRepository;
import com.abhisek.management.repository.GatePassRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class SecurityDashboardService {

    private final GatePassLogRepository gatePassLogRepository;
    private final GatePassRepository gatePassRepository;
    private final CurrentUserService currentUserService;

    public SecurityDashboardService(
            GatePassLogRepository gatePassLogRepository,
            GatePassRepository gatePassRepository,
            CurrentUserService currentUserService) {
        this.gatePassLogRepository = gatePassLogRepository;
        this.gatePassRepository = gatePassRepository;
        this.currentUserService = currentUserService;
    }

    public SecurityDashboardResponse getDashboard() {

        User currentUser = currentUserService.getCurrentUser();

        if (!"SECURITY".equals(currentUser.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only security officers can access this dashboard"
            );
        }

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        long todayExits =
                gatePassLogRepository
                        .countByVerifiedByAndActionAndScannedAtGreaterThanEqualAndScannedAtLessThan(
                                currentUser, "EXIT", start, end);

        long todayEntries =
                gatePassLogRepository
                        .countByVerifiedByAndActionAndScannedAtGreaterThanEqualAndScannedAtLessThan(
                                currentUser, "ENTRY", start, end);

        long currentlyOutside =
                gatePassRepository.countByStatus("OUTSIDE");

        long totalScansToday = todayExits + todayEntries;

        return new SecurityDashboardResponse(
                todayExits,
                todayEntries,
                currentlyOutside,
                totalScansToday
        );
    }
}