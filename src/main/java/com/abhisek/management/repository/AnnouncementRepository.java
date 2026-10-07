package com.abhisek.management.repository;

import com.abhisek.management.entity.Announcement;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementRepository
        extends JpaRepository<Announcement, Long> {

    List<Announcement> findByStatusOrderByCreatedAtDesc(
            String status
    );

    List<Announcement> findAllByOrderByCreatedAtDesc();

    List<Announcement> findByCreatedByOrderByCreatedAtDesc(
            User createdBy
    );

    List<Announcement> findByStatusAndExpiresAtBefore(
            String status,
            LocalDateTime time
    );
    List<Announcement>
    findByStatusAndPublishAtLessThanEqualAndNotificationSentFalse(
            String status,
            LocalDateTime time
    );

    long countByStatus(String status);
}