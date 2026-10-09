
package com.abhisek.management.dto;

import com.abhisek.management.entity.Attendance;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String subject;
    private LocalDate attendanceDate;
    private String status;
    private String markedByName;
    private LocalDateTime createdAt;

    public AttendanceResponse(Attendance attendance) {
        this.id = attendance.getId();
        this.studentId = attendance.getStudent().getId();
        this.studentName = attendance.getStudent().getName();
        this.studentEmail = attendance.getStudent().getEmail();
        this.subject = attendance.getSubject();
        this.attendanceDate = attendance.getAttendanceDate();
        this.status = attendance.getStatus();
        this.markedByName = attendance.getMarkedBy().getName();
        this.createdAt = attendance.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getSubject() {
        return subject;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public String getStatus() {
        return status;
    }

    public String getMarkedByName() {
        return markedByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
