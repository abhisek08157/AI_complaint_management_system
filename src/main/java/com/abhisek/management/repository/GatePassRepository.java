package com.abhisek.management.repository;

import com.abhisek.management.entity.GatePass;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GatePassRepository
        extends JpaRepository<GatePass, Long> {

    Optional<GatePass> findByPassCode(String passCode);

    Optional<GatePass> findByQrToken(String qrToken);

    List<GatePass> findByStudentOrderByCreatedAtDesc(User student);

    List<GatePass> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
    long countByStudentAndStatus(User student, String status);
}