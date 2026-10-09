
package com.abhisek.management.service;

import com.abhisek.management.dto.TimetableRequest;
import com.abhisek.management.dto.TimetableResponse;
import com.abhisek.management.entity.Timetable;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.TimetableRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Locale;

@Service
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final CurrentUserService currentUserService;

    public TimetableService(
            TimetableRepository timetableRepository,
            CurrentUserService currentUserService) {
        this.timetableRepository = timetableRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public TimetableResponse createTimetable(TimetableRequest request) {

        requireAdmin();
        validateRequest(request);

        Timetable timetable = new Timetable();
        applyRequest(timetable, request);

        checkConflicts(timetable, null);

        return new TimetableResponse(
                timetableRepository.save(timetable)
        );
    }

    @Transactional
    public TimetableResponse updateTimetable(
            Long id,
            TimetableRequest request) {

        requireAdmin();
        validateRequest(request);

        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Timetable entry not found"
                ));

        applyRequest(timetable, request);
        checkConflicts(timetable, id);

        return new TimetableResponse(
                timetableRepository.save(timetable)
        );
    }

    @Transactional
    public void deleteTimetable(Long id) {

        requireAdmin();

        Timetable timetable = timetableRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Timetable entry not found"
                ));

        timetableRepository.delete(timetable);
    }

    @Transactional(readOnly = true)
    public List<TimetableResponse> getSectionTimetable(
            String branch,
            Integer year,
            String section) {

        validateSection(branch, year, section);


return timetableRepository
        .findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
                branch, year, section
        )
        .stream()
        .map(TimetableResponse::new)
        .toList();

    }

    @Transactional(readOnly = true)
    public List<TimetableResponse> getSectionTimetableByDay(
            String branch,
            Integer year,
            String section,
            String dayOfWeek) {

        validateSection(branch, year, section);

        String day = normalizeDay(dayOfWeek);

        return timetableRepository
                .findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseAndDayOfWeekIgnoreCaseOrderByStartTimeAsc(
                        branch, year, section, day
                )
                .stream()
                .map(TimetableResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableResponse> getFacultyTimetable(
            String facultyName) {

        if (facultyName == null || facultyName.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Faculty name is required"
            );
        }

        return timetableRepository
                .findByFacultyNameIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
                        facultyName.trim()
                )
                .stream()
                .map(TimetableResponse::new)
                .toList();
    }

    private void applyRequest(
            Timetable timetable,
            TimetableRequest request) {

        timetable.setBranch(request.getBranch().trim());
        timetable.setYear(request.getYear());
        timetable.setSection(request.getSection().trim().toUpperCase(Locale.ROOT));
        timetable.setSubject(request.getSubject().trim());
        timetable.setFacultyName(request.getFacultyName().trim());
        timetable.setClassroom(request.getClassroom().trim());
        timetable.setDayOfWeek(normalizeDay(request.getDayOfWeek()));
        timetable.setStartTime(request.getStartTime());
        timetable.setEndTime(request.getEndTime());
    }

    private void validateRequest(TimetableRequest request) {

        if (request == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Timetable request is required"
            );
        }

        if (request.getStartTime() == null
                || request.getEndTime() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Start time and end time are required"
            );
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "End time must be after start time"
            );
        }

        if (request.getYear() == null
                || request.getYear() < 1
                || request.getYear() > 5) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Year must be between 1 and 5"
            );
        }

        normalizeDay(request.getDayOfWeek());
    }

    private void validateSection(
            String branch,
            Integer year,
            String section) {

        if (branch == null || branch.isBlank()
                || year == null || year < 1 || year > 5
                || section == null || section.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Valid branch, year, and section are required"
            );
        }
    }

    private String normalizeDay(String dayOfWeek) {

        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Day of week is required"
            );
        }

        String day = dayOfWeek.trim().toUpperCase(Locale.ROOT);

        if (!List.of(
                "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
                "FRIDAY", "SATURDAY", "SUNDAY"
        ).contains(day)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid day of week"
            );
        }

        return day;
    }

    private void checkConflicts(Timetable candidate, Long excludedId) {

        List<Timetable> existingEntries = timetableRepository.findAll();

        for (Timetable existing : existingEntries) {

            if (excludedId != null
                    && existing.getId().equals(excludedId)) {
                continue;
            }

            boolean sameDay = existing.getDayOfWeek()
                    .equalsIgnoreCase(candidate.getDayOfWeek());

            if (!sameDay) {
                continue;
            }

            boolean overlapping =
                    candidate.getStartTime().isBefore(existing.getEndTime())
                    && candidate.getEndTime().isAfter(existing.getStartTime());

            if (!overlapping) {
                continue;
            }

            boolean sameSection =
                    existing.getBranch().equalsIgnoreCase(candidate.getBranch())
                    && existing.getYear().equals(candidate.getYear())
                    && existing.getSection().equalsIgnoreCase(candidate.getSection());

            if (sameSection) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This section already has a class during the selected time"
                );
            }

            boolean sameFaculty =
                    existing.getFacultyName().equalsIgnoreCase(candidate.getFacultyName());

            if (sameFaculty) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This faculty member already has a class during the selected time"
                );
            }

            boolean sameClassroom =
                    existing.getClassroom().equalsIgnoreCase(candidate.getClassroom());

            if (sameClassroom) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This classroom is already booked during the selected time"
                );
            }
        }
    }

    private void requireAdmin() {

        User user = currentUserService.getCurrentUser();

        if (!"ADMIN".equalsIgnoreCase(
                String.valueOf(user.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can manage timetables"
            );
        }
    }
}
