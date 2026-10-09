
package com.abhisek.management.repository;

import com.abhisek.management.entity.FeePayment;
import com.abhisek.management.entity.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeePaymentRepository
        extends JpaRepository<FeePayment, Long> {

    List<FeePayment> findByFeeRecordOrderByCreatedAtDesc(
            FeeRecord feeRecord
    );

    List<FeePayment> findByFeeRecordStudentIdOrderByCreatedAtDesc(
            Long studentId
    );

    Optional<FeePayment> findByTransactionReference(
            String transactionReference
    );

    boolean existsByTransactionReference(String transactionReference);
}
