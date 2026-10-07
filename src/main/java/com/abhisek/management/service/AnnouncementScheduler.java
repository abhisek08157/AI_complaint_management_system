package com.abhisek.management.service;

import com.abhisek.management.entity.Announcement;
import com.abhisek.management.entity.User;
import com.abhisek.management.repository.AnnouncementRepository;
import com.abhisek.management.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AnnouncementScheduler {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public AnnouncementScheduler(
            AnnouncementRepository announcementRepository,
            UserRepository userRepository,
            NotificationService notificationService) {

        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ============================================================
    // CHECK EVERY MINUTE
    // ============================================================

    @Scheduled(fixedRate = 60000)
    public void processAnnouncements() {

        LocalDateTime now = LocalDateTime.now();

        processScheduledAnnouncements(now);

        processExpiredAnnouncements(now);
    }

    // ============================================================
    // SCHEDULED ANNOUNCEMENTS
    // ============================================================

    private void processScheduledAnnouncements(
            LocalDateTime now) {

        List<Announcement> announcements =
                announcementRepository
                        .findByStatusAndPublishAtLessThanEqualAndNotificationSentFalse(
                                "PUBLISHED",
                                now
                        );

        for (Announcement announcement : announcements) {

            sendAnnouncementNotifications(announcement);

            announcement.setNotificationSent(true);

            announcementRepository.save(announcement);
        }
    }

    // ============================================================
    // EXPIRED ANNOUNCEMENTS
    // ============================================================

    private void processExpiredAnnouncements(
            LocalDateTime now) {

        List<Announcement> announcements =
                announcementRepository
                        .findByStatusAndExpiresAtBefore(
                                "PUBLISHED",
                                now
                        );

        for (Announcement announcement : announcements) {

            announcement.setStatus("EXPIRED");

            announcementRepository.save(announcement);
        }
    }

    // ============================================================
    // SEND NOTIFICATIONS
    // ============================================================

    private void sendAnnouncementNotifications(
            Announcement announcement) {

        String audience =
                announcement.getTargetAudience();

        List<User> users;

        if ("ALL".equalsIgnoreCase(audience)) {

            users = userRepository.findAll();

        } else if ("STUDENT".equalsIgnoreCase(audience)) {

            users = userRepository.findByRole("STUDENT");

        } else if ("STAFF".equalsIgnoreCase(audience)) {

            users = userRepository.findByRole("STAFF");

        } else if ("HOSTEL".equalsIgnoreCase(audience)) {

            users = userRepository.findByRole("STUDENT");

        } else {

            return;
        }

        for (User user : users) {

            notificationService.createNotification(
                    user,
                    "New Campus Announcement",
                    announcement.getTitle(),
                    "ANNOUNCEMENT"
            );
        }
    }
}