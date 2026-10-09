
package com.abhisek.management.repository;

import com.abhisek.management.entity.MessMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MessMenuRepository
        extends JpaRepository<MessMenu, Long> {

    List<MessMenu> findByMenuDateOrderByMealTypeAsc(
            LocalDate menuDate
    );

    Optional<MessMenu> findByMenuDateAndMealType(
            LocalDate menuDate,
            String mealType
    );

    List<MessMenu> findByMenuDateBetweenOrderByMenuDateAscMealTypeAsc(
            LocalDate startDate,
            LocalDate endDate
    );

    boolean existsByMenuDateAndMealType(
            LocalDate menuDate,
            String mealType
    );
}
