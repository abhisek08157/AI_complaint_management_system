
package com.abhisek.management.repository;

import com.abhisek.management.entity.GatePass;
import com.abhisek.management.entity.GatePassLog;
import com.abhisek.management.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GatePassLogRepository
        extends JpaRepository<GatePassLog, Long> {

    List<GatePassLog> findByGatePassOrderByScannedAtDesc(
            GatePass gatePass
    );

    long countByVerifiedByAndActionAndScannedAtGreaterThanEqualAndScannedAtLessThan(
            User verifiedBy,
            String action,
            LocalDateTime start,
            LocalDateTime end
    );
}
