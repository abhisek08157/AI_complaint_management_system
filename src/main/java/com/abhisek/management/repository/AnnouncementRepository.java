
package com.abhisek.management.repository;

import com.abhisek.management.entity.Announcement;
import com.abhisek.management.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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

    @Query("""
           SELECT a
           FROM Announcement a
           JOIN FETCH a.createdBy
           WHERE a.id = :id
           """)
    Optional<Announcement> findByIdWithCreator(
            @Param("id") Long id
    );

    long countByStatus(String status);
}
