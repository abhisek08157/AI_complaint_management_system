package com.abhisek.management.service;

import com.abhisek.management.entity.Notification;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUserService currentUserService;

    public NotificationService(
            NotificationRepository notificationRepository,
            CurrentUserService currentUserService) {

        this.notificationRepository = notificationRepository;
        this.currentUserService = currentUserService;
    }

    public Notification createNotification(
            User user,
            String title,
            String message,
            String type) {

        Notification notification =
                new Notification(user, title, message, type);

        return notificationRepository.save(notification);
    }

    public List<Notification> getMyNotifications() {

        User currentUser = currentUserService.getCurrentUser();

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(currentUser);
    }

    public List<Notification> getMyUnreadNotifications() {

        User currentUser = currentUserService.getCurrentUser();

        return notificationRepository
                .findByUserAndReadFalseOrderByCreatedAtDesc(currentUser);
    }

    public long getUnreadCount() {

        User currentUser = currentUserService.getCurrentUser();

        return notificationRepository
                .countByUserAndReadFalse(currentUser);
    }

    public void markAsRead(Long notificationId) {

        User currentUser = currentUserService.getCurrentUser();

        Notification notification =
                notificationRepository.findById(notificationId)
                        .orElseThrow(() ->
                                new ApiException(
                                        HttpStatus.NOT_FOUND,
                                        "Notification not found"
                                )
                        );

        if (!notification.getUser().getId()
                .equals(currentUser.getId())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own notifications"
            );
        }

        notification.setRead(true);

        notificationRepository.save(notification);
    }

    public void markAllAsRead() {

        User currentUser = currentUserService.getCurrentUser();

        List<Notification> notifications =
                notificationRepository
                        .findByUserAndReadFalseOrderByCreatedAtDesc(
                                currentUser
                        );

        for (Notification notification : notifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(notifications);
    }
}