
package com.abhisek.management.repository;

import com.abhisek.management.entity.Timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    // Get a section's timetable for a particular day.
    List<Timetable>
    findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseAndDayOfWeekIgnoreCaseOrderByStartTimeAsc(
            String branch,
            Integer year,
            String section,
            String dayOfWeek
    );

    // Get the complete timetable for a section.
    List<Timetable>
    findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
            String branch,
            Integer year,
            String section
    );

    // Get all classes assigned to a faculty member.
    List<Timetable>
    findByFacultyNameIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
            String facultyName
    );

    // Find classes overlapping the specified day and time range.
    // Exclude the current record when updating an existing timetable entry.
    @Query("""
            SELECT t FROM Timetable t
            WHERE UPPER(t.dayOfWeek) = UPPER(:dayOfWeek)
              AND t.startTime < :endTime
              AND t.endTime > :startTime
              AND (:excludedId IS NULL OR t.id <> :excludedId)
            """)
    List<Timetable> findOverlappingEntries(
            @Param("dayOfWeek") String dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludedId") Long excludedId
    );
}
