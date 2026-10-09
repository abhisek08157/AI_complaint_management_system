
package com.abhisek.management.repository;

import com.abhisek.management.entity.MessFeedback;
import com.abhisek.management.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MessFeedbackRepository
        extends JpaRepository<MessFeedback, Long> {

    List<MessFeedback> findByStudentOrderByCreatedAtDesc(
            User student
    );

    List<MessFeedback> findAllByOrderByCreatedAtDesc();

    List<MessFeedback> findByFeedbackDateOrderByCreatedAtDesc(
            LocalDate feedbackDate
    );

    List<MessFeedback> findByMealTypeOrderByCreatedAtDesc(
            String mealType
    );

    boolean existsByStudentAndFeedbackDateAndMealType(
            User student,
            LocalDate feedbackDate,
            String mealType
    );
}
