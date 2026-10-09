
package com.abhisek.management.repository;

import com.abhisek.management.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseAndDayOfWeekIgnoreCaseOrderByStartTimeAsc(
            String branch,
            Integer year,
            String section,
            String dayOfWeek
    );

   

    List<Timetable> findByFacultyNameIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
            String facultyName
    );
    List<Timetable> findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
            String branch,
            Integer year,
            String section
    );

    boolean existsByBranchIgnoreCaseAndYearAndSectionIgnoreCaseAndDayOfWeekIgnoreCaseAndStartTimeAndClassroomIgnoreCase(
            String branch,
            Integer year,
            String section,
            String dayOfWeek,
            java.time.LocalTime startTime,
            String classroom
    );
    
}
