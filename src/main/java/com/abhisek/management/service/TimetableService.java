
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

    // Admin creates a timetable entry.
    @Transactional
    public TimetableResponse createTimetable(TimetableRequest request) {

        requireAdmin();
        validateRequest(request);

        Timetable timetable = new Timetable();
        applyRequest(timetable, request);

        checkConflicts(timetable, null);

        Timetable savedTimetable = timetableRepository.save(timetable);

        return new TimetableResponse(savedTimetable);
    }

    // Admin updates an existing timetable entry.
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

        Timetable updatedTimetable = timetableRepository.save(timetable);

        return new TimetableResponse(updatedTimetable);
    }

    // Admin deletes a timetable entry.
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

    // Retrieve the complete timetable for a section.
    @Transactional(readOnly = true)
    public List<TimetableResponse> getSectionTimetable(
            String branch,
            Integer year,
            String section) {

        validateSection(branch, year, section);

        return timetableRepository
                .findByBranchIgnoreCaseAndYearAndSectionIgnoreCaseOrderByDayOfWeekAscStartTimeAsc(
                        branch.trim(),
                        year,
                        section.trim()
                )
                .stream()
                .map(TimetableResponse::new)
                .toList();
    }

    // Retrieve a section's timetable for a particular day.
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
                        branch.trim(),
                        year,
                        section.trim(),
                        day
                )
                .stream()
                .map(TimetableResponse::new)
                .toList();
    }

    // Retrieve a faculty member's timetable.
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

    // Copy validated request values into the entity.
    private void applyRequest(
            Timetable timetable,
            TimetableRequest request) {

        timetable.setBranch(request.getBranch().trim());
        timetable.setYear(request.getYear());
        timetable.setSection(
                request.getSection().trim().toUpperCase(Locale.ROOT)
        );
        timetable.setSubject(request.getSubject().trim());
        timetable.setFacultyName(request.getFacultyName().trim());
        timetable.setClassroom(request.getClassroom().trim());
        timetable.setDayOfWeek(normalizeDay(request.getDayOfWeek()));
        timetable.setStartTime(request.getStartTime());
        timetable.setEndTime(request.getEndTime());
    }

    // Validate timetable values before saving.
    private void validateRequest(TimetableRequest request) {

        if (request == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Timetable request is required"
            );
        }

        if (request.getBranch() == null
                || request.getBranch().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Branch is required"
            );
        }

        if (request.getSection() == null
                || request.getSection().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Section is required"
            );
        }

        if (request.getSubject() == null
                || request.getSubject().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Subject is required"
            );
        }

        if (request.getFacultyName() == null
                || request.getFacultyName().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Faculty name is required"
            );
        }

        if (request.getClassroom() == null
                || request.getClassroom().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Classroom is required"
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

    // Validate section query parameters.
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

    // Normalize and validate day names.
    private String normalizeDay(String dayOfWeek) {

        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Day of week is required"
            );
        }

        String day = dayOfWeek.trim().toUpperCase(Locale.ROOT);

        if (!List.of(
                "MONDAY",
                "TUESDAY",
                "WEDNESDAY",
                "THURSDAY",
                "FRIDAY",
                "SATURDAY",
                "SUNDAY"
        ).contains(day)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid day of week"
            );
        }

        return day;
    }

    // Check for section, faculty, and classroom conflicts.
    private void checkConflicts(
            Timetable candidate,
            Long excludedId) {

        List<Timetable> overlappingEntries =
                timetableRepository.findOverlappingEntries(
                        candidate.getDayOfWeek(),
                        candidate.getStartTime(),
                        candidate.getEndTime(),
                        excludedId
                );

        for (Timetable existing : overlappingEntries) {

            boolean sameSection =
                    existing.getBranch().equalsIgnoreCase(
                            candidate.getBranch()
                    )
                    && existing.getYear().equals(candidate.getYear())
                    && existing.getSection().equalsIgnoreCase(
                            candidate.getSection()
                    );

            if (sameSection) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This section already has a class during the selected time"
                );
            }

            boolean sameFaculty =
                    existing.getFacultyName().equalsIgnoreCase(
                            candidate.getFacultyName()
                    );

            if (sameFaculty) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This faculty member already has a class during the selected time"
                );
            }

            boolean sameClassroom =
                    existing.getClassroom().equalsIgnoreCase(
                            candidate.getClassroom()
                    );

            if (sameClassroom) {
                throw new ApiException(
                        HttpStatus.CONFLICT,
                        "This classroom is already booked during the selected time"
                );
            }
        }
    }

    // Only administrators may create, update, or delete timetables.
    private void requireAdmin() {

        User user = currentUserService.getCurrentUser();

        if (user == null
                || !"ADMIN".equalsIgnoreCase(
                        String.valueOf(user.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can manage timetables"
            );
        }
    }
}
