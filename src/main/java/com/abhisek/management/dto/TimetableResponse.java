
package com.abhisek.management.dto;

import com.abhisek.management.entity.Timetable;

import java.time.LocalDateTime;
import java.time.LocalTime;

public class TimetableResponse {

    private Long id;
    private String branch;
    private Integer year;
    private String section;
    private String subject;
    private String facultyName;
    private String classroom;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TimetableResponse() {
    }

    public TimetableResponse(Timetable timetable) {
        this.id = timetable.getId();
        this.branch = timetable.getBranch();
        this.year = timetable.getYear();
        this.section = timetable.getSection();
        this.subject = timetable.getSubject();
        this.facultyName = timetable.getFacultyName();
        this.classroom = timetable.getClassroom();
        this.dayOfWeek = timetable.getDayOfWeek();
        this.startTime = timetable.getStartTime();
        this.endTime = timetable.getEndTime();
        this.createdAt = timetable.getCreatedAt();
        this.updatedAt = timetable.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public String getBranch() {
        return branch;
    }

    public Integer getYear() {
        return year;
    }

    public String getSection() {
        return section;
    }

    public String getSubject() {
        return subject;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public String getClassroom() {
        return classroom;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
