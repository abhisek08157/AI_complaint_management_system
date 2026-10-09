package com.abhisek.management.repository;

import com.abhisek.management.entity.FeeRecord;
import com.abhisek.management.entity.User;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FeeRecordRepository
        extends JpaRepository<FeeRecord, Long> {

    // Find all fee records for a student.
    List<FeeRecord> findByStudentOrderByDueDateAsc(User student);

    // Find fee records for a student by status.
    List<FeeRecord> findByStudentAndStatusOrderByDueDateAsc(
            User student,
            String status
    );

    // Find all fee records.
    List<FeeRecord> findAllByOrderByDueDateAsc();

    // Find fee records by status.
    List<FeeRecord> findByStatusOrderByDueDateAsc(String status);

    // Find fee records using the student's ID.
    List<FeeRecord> findByStudentIdOrderByDueDateAsc(Long studentId);

    // Lock a fee record while processing a payment.
    // This helps prevent simultaneous payments from exceeding
    // the outstanding balance when used inside a transaction.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM FeeRecord f WHERE f.id = :id")
    Optional<FeeRecord> findByIdForUpdate(@Param("id") Long id);
}