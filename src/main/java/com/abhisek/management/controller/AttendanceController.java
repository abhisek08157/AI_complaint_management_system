package com.abhisek.management.controller;

import com.abhisek.management.dto.AttendanceRequest;
import com.abhisek.management.dto.AttendanceResponse;
import com.abhisek.management.entity.User;
import com.abhisek.management.repository.UserRepository;
import com.abhisek.management.service.AttendanceService;

import jakarta.validation.Valid;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(
            AttendanceService attendanceService,
            UserRepository userRepository) {

        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
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

    // STAFF / ADMIN - GET STUDENT LIST
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<User>> getStudents() {

        List<User> students =
                userRepository.findByRole("STUDENT");

        return ResponseEntity.ok(students);
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
    public ResponseEntity<List<AttendanceResponse>> getAttendanceBySubjectAndDate(
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