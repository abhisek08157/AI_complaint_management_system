
package com.abhisek.management.dto;

import com.abhisek.management.entity.FeeRecord;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class FeeRecordResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String feeType;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDate dueDate;
    private String academicYear;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public FeeRecordResponse() {
    }

    public FeeRecordResponse(FeeRecord feeRecord) {
        this.id = feeRecord.getId();

        if (feeRecord.getStudent() != null) {
            this.studentId = feeRecord.getStudent().getId();
            this.studentName = feeRecord.getStudent().getName();
            this.studentEmail = feeRecord.getStudent().getEmail();
        }

        this.feeType = feeRecord.getFeeType();
        this.totalAmount = feeRecord.getTotalAmount();
        this.paidAmount = feeRecord.getPaidAmount();

        this.remainingAmount = feeRecord.getTotalAmount()
                .subtract(feeRecord.getPaidAmount());

        this.dueDate = feeRecord.getDueDate();
        this.academicYear = feeRecord.getAcademicYear();
        this.status = feeRecord.getStatus();
        this.createdAt = feeRecord.getCreatedAt();
        this.updatedAt = feeRecord.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public String getFeeType() {
        return feeType;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
