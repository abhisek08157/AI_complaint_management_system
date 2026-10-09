
package com.abhisek.management.controller;

import com.abhisek.management.dto.MessMenuRequest;
import com.abhisek.management.dto.MessMenuResponse;
import com.abhisek.management.service.MessMenuService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mess-menu")
public class MessMenuController {

    private final MessMenuService messMenuService;

    public MessMenuController(MessMenuService messMenuService) {
        this.messMenuService = messMenuService;
    }

    // ADMIN / HOSTEL WARDEN - CREATE MENU
    @PostMapping
    public ResponseEntity<MessMenuResponse> createMenu(
            @Valid @RequestBody MessMenuRequest request) {

        MessMenuResponse response =
                messMenuService.createMenu(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // AUTHENTICATED USERS - VIEW MENU FOR A DATE
    @GetMapping
    public ResponseEntity<List<MessMenuResponse>> getMenuByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                messMenuService.getMenuByDate(date)
        );
    }

    // AUTHENTICATED USERS - VIEW MENU FOR A DATE RANGE
    @GetMapping("/range")
    public ResponseEntity<List<MessMenuResponse>> getMenuBetweenDates(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {

        return ResponseEntity.ok(
                messMenuService.getMenuBetweenDates(
                        startDate, endDate)
        );
    }

    // ADMIN / HOSTEL WARDEN - UPDATE MENU
    @PutMapping("/{id}")
    public ResponseEntity<MessMenuResponse> updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MessMenuRequest request) {

        return ResponseEntity.ok(
                messMenuService.updateMenu(id, request)
        );
    }

    // ADMIN / HOSTEL WARDEN - DELETE MENU
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(
            @PathVariable Long id) {

        messMenuService.deleteMenu(id);
        return ResponseEntity.noContent().build();
    }
}
