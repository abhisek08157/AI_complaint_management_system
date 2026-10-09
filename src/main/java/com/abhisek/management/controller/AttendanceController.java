
package com.abhisek.management.controller;

import com.abhisek.management.dto.AttendanceRequest;
import com.abhisek.management.dto.AttendanceResponse;
import com.abhisek.management.service.AttendanceService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // STAFF - MARK ATTENDANCE
    @PostMapping
    public ResponseEntity<AttendanceResponse> markAttendance(
            @Valid @RequestBody AttendanceRequest request) {

        AttendanceResponse response =
                attendanceService.markAttendance(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // STUDENT - VIEW OWN ATTENDANCE
    @GetMapping("/my")
    public ResponseEntity<List<AttendanceResponse>> getMyAttendance() {

        return ResponseEntity.ok(
                attendanceService.getMyAttendance()
        );
    }

    // STAFF / ADMIN - VIEW A STUDENT'S ATTENDANCE
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getStudentAttendance(
            @PathVariable Long studentId) {

        return ResponseEntity.ok(
                attendanceService.getStudentAttendance(studentId)
        );
    }

    // STAFF / ADMIN - VIEW ATTENDANCE BY SUBJECT AND DATE
    @GetMapping("/by-subject")
    public ResponseEntity<List<AttendanceResponse>>
    getAttendanceBySubjectAndDate(
            @RequestParam String subject,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {

        return ResponseEntity.ok(
                attendanceService.getAttendanceBySubjectAndDate(
                        subject,
                        date
                )
        );
    }
}
