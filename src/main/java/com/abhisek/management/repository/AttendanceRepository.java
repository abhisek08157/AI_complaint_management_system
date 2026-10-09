
package com.abhisek.management.repository;

import com.abhisek.management.entity.Attendance;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentOrderByAttendanceDateDesc(
            User student
    );

    List<Attendance> findByStudentAndSubjectOrderByAttendanceDateDesc(
            User student,
            String subject
    );

    List<Attendance> findBySubjectAndAttendanceDate(
            String subject,
            LocalDate attendanceDate
    );

    List<Attendance> findByAttendanceDateOrderBySubjectAsc(
            LocalDate attendanceDate
    );

    boolean existsByStudentAndSubjectAndAttendanceDate(
            User student,
            String subject,
            LocalDate attendanceDate
    );

    long countByStudentAndSubjectAndStatus(
            User student,
            String subject,
            String status
    );

    long countByStudentAndStatus(
            User student,
            String status
    );
}
