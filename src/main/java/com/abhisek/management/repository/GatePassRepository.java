package com.abhisek.management.repository;

import com.abhisek.management.entity.GatePass;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GatePassRepository
        extends JpaRepository<GatePass, Long> {

    Optional<GatePass> findByPassCode(String passCode);

    @EntityGraph(attributePaths = {"student"})
    Optional<GatePass> findByQrToken(String qrToken);

    @EntityGraph(attributePaths = {"student"})
    List<GatePass> findByStudentOrderByCreatedAtDesc(User student);

    @EntityGraph(attributePaths = {"student"})
    List<GatePass> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"student"})
    @Query("SELECT gp FROM GatePass gp WHERE gp.id = :id")
    Optional<GatePass> findByIdWithStudent(@Param("id") Long id);

    long countByStatus(String status);

    long countByStudentAndStatus(User student, String status);
}
