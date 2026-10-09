
package com.abhisek.management.repository;

import com.abhisek.management.entity.FeeRecord;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRecordRepository
        extends JpaRepository<FeeRecord, Long> {

    List<FeeRecord> findByStudentOrderByDueDateAsc(User student);

    List<FeeRecord> findByStudentAndStatusOrderByDueDateAsc(
            User student,
            String status
    );

    List<FeeRecord> findAllByOrderByDueDateAsc();

    List<FeeRecord> findByStatusOrderByDueDateAsc(String status);

    List<FeeRecord> findByStudentIdOrderByDueDateAsc(Long studentId);
}
