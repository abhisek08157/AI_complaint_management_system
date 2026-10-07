package com.abhisek.management.repository;

import com.abhisek.management.entity.CampusRequest;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampusRequestRepository
        extends JpaRepository<CampusRequest, Long> {

    List<CampusRequest> findByUserOrderByCreatedAtDesc(User user);

    List<CampusRequest> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
    long countByUser(User user);

    long countByUserAndStatus(User user, String status);
}