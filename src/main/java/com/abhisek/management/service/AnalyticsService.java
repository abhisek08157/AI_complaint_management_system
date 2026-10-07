package com.abhisek.management.service;

import com.abhisek.management.dto.AnalyticsDashboardResponse;
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
                announcementStats
        );
    }
}