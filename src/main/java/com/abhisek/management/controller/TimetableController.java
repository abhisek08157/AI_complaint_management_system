
package com.abhisek.management.controller;

import com.abhisek.management.dto.TimetableRequest;
import com.abhisek.management.dto.TimetableResponse;
import com.abhisek.management.service.TimetableService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
public class TimetableController {

    private final TimetableService timetableService;

    public TimetableController(TimetableService timetableService) {
        this.timetableService = timetableService;
    }

    // Admin creates a timetable entry.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimetableResponse createTimetable(
            @Valid @RequestBody TimetableRequest request) {

        return timetableService.createTimetable(request);
    }

    // Admin updates a timetable entry.
    @PutMapping("/{id}")
    public TimetableResponse updateTimetable(
            @PathVariable Long id,
            @Valid @RequestBody TimetableRequest request) {

        return timetableService.updateTimetable(id, request);
    }

    // Admin deletes a timetable entry.
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTimetable(@PathVariable Long id) {

        timetableService.deleteTimetable(id);
    }

    // View the complete timetable for a section.
    @GetMapping("/section")
    public List<TimetableResponse> getSectionTimetable(
            @RequestParam String branch,
            @RequestParam Integer year,
            @RequestParam String section) {

        return timetableService.getSectionTimetable(
                branch,
                year,
                section
        );
    }

    // View a section's timetable for a particular day.
    @GetMapping("/section/day")
    public List<TimetableResponse> getSectionTimetableByDay(
            @RequestParam String branch,
            @RequestParam Integer year,
            @RequestParam String section,
            @RequestParam String day) {

        return timetableService.getSectionTimetableByDay(
                branch,
                year,
                section,
                day
        );
    }

    // View a faculty member's timetable.
    @GetMapping("/faculty")
    public List<TimetableResponse> getFacultyTimetable(
            @RequestParam String facultyName) {

        return timetableService.getFacultyTimetable(facultyName);
    }
}
