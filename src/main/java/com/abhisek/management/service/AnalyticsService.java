package com.abhisek.management.service;

import com.abhisek.management.dto.AnalyticsDashboardResponse;
import com.abhisek.management.entity.Complaint;
import com.abhisek.management.entity.User;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Comparator;
import java.util.stream.Collectors;
import com.abhisek.management.repository.AnnouncementRepository;
import com.abhisek.management.repository.CampusRequestRepository;
import com.abhisek.management.repository.ComplaintRepository;
import com.abhisek.management.repository.GatePassRepository;
import com.abhisek.management.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;
    private final CampusRequestRepository campusRequestRepository;
    private final GatePassRepository gatePassRepository;
    private final AnnouncementRepository announcementRepository;

    public AnalyticsService(
            UserRepository userRepository,
            ComplaintRepository complaintRepository,
            CampusRequestRepository campusRequestRepository,
            GatePassRepository gatePassRepository,
            AnnouncementRepository announcementRepository) {

        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
        this.campusRequestRepository = campusRequestRepository;
        this.gatePassRepository = gatePassRepository;
        this.announcementRepository = announcementRepository;
    }

    public AnalyticsDashboardResponse getDashboard() {

        // =========================
        // USER STATISTICS
        // =========================

        long totalUsers = userRepository.count();

        long students =
                userRepository.countByRole("STUDENT");

        long staff =
                userRepository.countByRole("STAFF");

        long wardens =
                userRepository.countByRole("HOSTEL_WARDEN");

        long security =
                userRepository.countByRole("SECURITY");

        long admins =
                userRepository.countByRole("ADMIN");

        AnalyticsDashboardResponse.UserStats userStats =
                new AnalyticsDashboardResponse.UserStats(
                        totalUsers,
                        students,
                        staff,
                        wardens,
                        security,
                        admins
                );


        // =========================
        // COMPLAINT STATISTICS
        // =========================

        long totalComplaints =
                complaintRepository.count();

        long submitted =
                complaintRepository.countByStatus("SUBMITTED");

        long assigned =
                complaintRepository.countByStatus("ASSIGNED");

        long inProgress =
                complaintRepository.countByStatus("IN_PROGRESS");

        long resolved =
                complaintRepository.countByStatus("RESOLVED");

        AnalyticsDashboardResponse.ComplaintStats complaintStats =
                new AnalyticsDashboardResponse.ComplaintStats(
                        totalComplaints,
                        submitted,
                        assigned,
                        inProgress,
                        resolved
                );


        // =========================
        // CAMPUS REQUEST STATISTICS
        // =========================

        long totalRequests =
                campusRequestRepository.count();

        long pending =
                campusRequestRepository.countByStatus("PENDING");

        long underReview =
                campusRequestRepository.countByStatus("UNDER_REVIEW");

        long approved =
                campusRequestRepository.countByStatus("APPROVED");

        long rejected =
                campusRequestRepository.countByStatus("REJECTED");

        long completed =
                campusRequestRepository.countByStatus("COMPLETED");

        AnalyticsDashboardResponse.RequestStats requestStats =
                new AnalyticsDashboardResponse.RequestStats(
                        totalRequests,
                        pending,
                        underReview,
                        approved,
                        rejected,
                        completed
                );


        // =========================
        // GATE PASS STATISTICS
        // =========================

        long totalGatePasses =
                gatePassRepository.count();

        long gatePending =
                gatePassRepository.countByStatus("PENDING");

        long gateApproved =
                gatePassRepository.countByStatus("APPROVED");

        long gateRejected =
                gatePassRepository.countByStatus("REJECTED");

        long outside =
                gatePassRepository.countByStatus("OUTSIDE");

        long gateCompleted =
                gatePassRepository.countByStatus("COMPLETED");

        AnalyticsDashboardResponse.GatePassStats gatePassStats =
                new AnalyticsDashboardResponse.GatePassStats(
                        totalGatePasses,
                        gatePending,
                        gateApproved,
                        gateRejected,
                        outside,
                        gateCompleted
                );


        // =========================
        // ANNOUNCEMENT STATISTICS
        // =========================

        long totalAnnouncements =
                announcementRepository.count();

        long draft =
                announcementRepository.countByStatus("DRAFT");

        long published =
                announcementRepository.countByStatus("PUBLISHED");

        long expired =
                announcementRepository.countByStatus("EXPIRED");

        AnalyticsDashboardResponse.AnnouncementStats announcementStats =
                new AnalyticsDashboardResponse.AnnouncementStats(
                        totalAnnouncements,
                        draft,
                        published,
                        expired
                );


        // =========================
        // FINAL DASHBOARD
        // =========================

        return new AnalyticsDashboardResponse(
                userStats,
                complaintStats,
                requestStats,
                gatePassStats,
                announcementStats,
                buildComplaintInsights()
        );
    }

    private AnalyticsDashboardResponse.ComplaintInsights buildComplaintInsights() {
        java.util.List<Complaint> all = complaintRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        long open = 0, overdue = 0, age0To2 = 0, age3To7 = 0, ageOver7 = 0;
        long resolvedWithDuration = 0, totalResolutionMinutes = 0, recurring = 0;
        Map<String, Long> locations = new LinkedHashMap<>();
        Map<String, long[]> staffCounts = new LinkedHashMap<>();

        for (Complaint c : all) {
            String status = c.getStatus() == null ? "" : c.getStatus().toUpperCase();
            boolean closed = status.equals("RESOLVED") || status.equals("CLOSED")
                    || status.equals("COMPLETED") || status.equals("REJECTED");

            if (!closed) {
                open++;
                if (c.getCreatedAt() != null) {
                    long days = Math.max(0, Duration.between(c.getCreatedAt(), now).toDays());
                    if (days > 7) overdue++;
                    if (days <= 2) age0To2++;
                    else if (days <= 7) age3To7++;
                    else ageOver7++;
                }
            }

            if (c.getCreatedAt() != null && c.getResolvedAt() != null
                    && !c.getResolvedAt().isBefore(c.getCreatedAt())) {
                totalResolutionMinutes += Duration.between(c.getCreatedAt(), c.getResolvedAt()).toMinutes();
                resolvedWithDuration++;
            }

            if (c.isPossibleRecurringIssue()) {
                recurring++;
                String location = c.getLocation();
                if (location == null || location.isBlank()) location = "Unspecified location";
                locations.merge(location.trim(), 1L, Long::sum);
            }

            User assigned = c.getAssignedStaff();
            if (assigned != null) {
                String name = assigned.getName();
                if (name == null || name.isBlank()) name = assigned.getEmail();
                long[] counts = staffCounts.computeIfAbsent(name, key -> new long[3]);
                counts[0]++;
                if (!closed) counts[1]++;
                if (status.equals("RESOLVED") || status.equals("CLOSED")) counts[2]++;
            }
        }

        double averageHours = resolvedWithDuration == 0 ? 0.0
                : (double) totalResolutionMinutes / resolvedWithDuration / 60.0;

        java.util.List<AnalyticsDashboardResponse.StaffWorkload> staffWorkload =
                staffCounts.entrySet().stream()
                        .map(e -> new AnalyticsDashboardResponse.StaffWorkload(
                                e.getKey(), e.getValue()[0], e.getValue()[1], e.getValue()[2]))
                        .sorted(Comparator.comparingLong(
                                AnalyticsDashboardResponse.StaffWorkload::getOpenComplaints).reversed())
                        .collect(Collectors.toList());

        java.util.List<AnalyticsDashboardResponse.RecurringLocation> recurringLocations =
                locations.entrySet().stream()
                        .map(e -> new AnalyticsDashboardResponse.RecurringLocation(e.getKey(), e.getValue()))
                        .sorted(Comparator.comparingLong(
                                AnalyticsDashboardResponse.RecurringLocation::getCount).reversed())
                        .limit(10)
                        .collect(Collectors.toList());

        return new AnalyticsDashboardResponse.ComplaintInsights(
                open, overdue, age0To2, age3To7, ageOver7, resolvedWithDuration,
                averageHours, recurring, staffWorkload, recurringLocations);
    }

}
