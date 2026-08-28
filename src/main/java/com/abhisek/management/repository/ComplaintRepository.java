package com.abhisek.management.repository;


import com.abhisek.management.entity.Complaint;
import com.abhisek.management.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserOrderByCreatedAtDesc(
            User user
    );

    List<Complaint> findByAssignedStaffOrderByCreatedAtDesc(
            User staff
    );

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}