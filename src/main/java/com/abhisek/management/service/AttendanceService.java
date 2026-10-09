
package com.abhisek.management.service;

import com.abhisek.management.dto.AttendanceRequest;
import com.abhisek.management.dto.AttendanceResponse;
import com.abhisek.management.entity.Attendance;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.AttendanceRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService) {

        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    // STAFF - MARK ATTENDANCE
    @Transactional
    public AttendanceResponse markAttendance(
            AttendanceRequest request) {

        User staff = currentUserService.getCurrentUser();

        if (!"STAFF".equalsIgnoreCase(staff.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only staff members can mark attendance"
            );
        }

        if (request == null
                || request.getStudentId() == null
                || request.getAttendanceDate() == null
                || request.getSubject() == null
                || request.getSubject().isBlank()
                || request.getStatus() == null
                || request.getStatus().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Student ID, subject, date and status are required"
            );
        }

        User student = userRepository.findById(
                request.getStudentId()
        ).orElseThrow(() -> new ApiException(
                HttpStatus.NOT_FOUND,
                "Student not found"
        ));

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance can only be marked for students"
            );
        }

        String subject = request.getSubject().trim();
        String status = request.getStatus().trim().toUpperCase();
        LocalDate date = request.getAttendanceDate();

        if (!status.equals("PRESENT") && !status.equals("ABSENT")) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be PRESENT or ABSENT"
            );
        }

        if (date.isAfter(LocalDate.now())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance date cannot be in the future"
            );
        }

        boolean alreadyExists =
                attendanceRepository
                        .existsByStudentAndSubjectAndAttendanceDate(
                                student,
                                subject,
                                date
                        );

        if (alreadyExists) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Attendance already exists for this student, subject and date"
            );
        }

        Attendance attendance = new Attendance();
        attendance.setStudent(student);
        attendance.setMarkedBy(staff);
        attendance.setSubject(subject);
        attendance.setAttendanceDate(date);
        attendance.setStatus(status);

        Attendance saved =
                attendanceRepository.save(attendance);

        return new AttendanceResponse(saved);
    }

    // STUDENT - VIEW OWN ATTENDANCE
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendance() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can view their own attendance"
            );
        }

        return attendanceRepository
                .findByStudentOrderByAttendanceDateDesc(student)
                .stream()
                .map(AttendanceResponse::new)
                .toList();
    }

    // STAFF / ADMIN - VIEW ONE STUDENT'S ATTENDANCE
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getStudentAttendance(
            Long studentId) {

        User currentUser = currentUserService.getCurrentUser();

        if (!"STAFF".equalsIgnoreCase(currentUser.getRole())
                && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only staff or admin can view another student's attendance"
            );
        }

        if (studentId == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Student ID is required"
            );
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"
                ));

        if (!"STUDENT".equalsIgnoreCase(student.getRole())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "The specified user is not a student"
            );
        }

        return attendanceRepository
                .findByStudentOrderByAttendanceDateDesc(student)
                .stream()
                .map(AttendanceResponse::new)
                .toList();
    }

    // STAFF / ADMIN - VIEW ATTENDANCE BY SUBJECT AND DATE
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceBySubjectAndDate(
            String subject,
            LocalDate date) {

        User currentUser = currentUserService.getCurrentUser();

        if (!"STAFF".equalsIgnoreCase(currentUser.getRole())
                && !"ADMIN".equalsIgnoreCase(currentUser.getRole())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only staff or admin can view attendance by subject and date"
            );
        }

        if (subject == null || subject.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Subject is required"
            );
        }

        if (date == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Attendance date is required"
            );
        }

        return attendanceRepository
                .findBySubjectAndAttendanceDate(
                        subject.trim(),
                        date
                )
                .stream()
                .map(AttendanceResponse::new)
                .toList();
    }
}
