package com.abhisek.management.controller;

import com.abhisek.management.dto.NotificationResponse;
import com.abhisek.management.entity.Notification;
import com.abhisek.management.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {

        List<NotificationResponse> response =
                notificationService.getMyNotifications()
                        .stream()
                        .map(NotificationResponse::new)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications() {

        List<NotificationResponse> response =
                notificationService.getMyUnreadNotifications()
                        .stream()
                        .map(NotificationResponse::new)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount() {

        return ResponseEntity.ok(
                notificationService.getUnreadCount()
        );
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<String> markAsRead(
            @PathVariable Long id) {

        notificationService.markAsRead(id);

        return ResponseEntity.ok(
                "Notification marked as read"
        );
    }

    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead() {

        notificationService.markAllAsRead();

        return ResponseEntity.ok(
                "All notifications marked as read"
        );
    }
}