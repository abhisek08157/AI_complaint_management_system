package com.abhisek.management.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "gate_passes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_gate_pass_code",
                        columnNames = "pass_code"
                ),
                @UniqueConstraint(
                        name = "uk_gate_pass_qr_token",
                        columnNames = "qr_token"
                )
        }
)
public class GatePass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "pass_code",
            nullable = false,
            unique = true
    )
    private String passCode;

    @Column(
            name = "qr_token",
            nullable = false,
            unique = true,
            length = 100
    )
    private String qrToken;

    @Column(nullable = false, length = 1000)
    private String reason;

    @Column(nullable = false)
    private String destination;

    private LocalDateTime outTime;

    private LocalDateTime expectedReturnTime;

    @Column(nullable = false)
    private String status;
    @Column(length = 1000)
    private String wardenRemarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false
    )
    private User student;

    private LocalDateTime createdAt;

    private LocalDateTime approvedAt;

    private LocalDateTime expiresAt;

    public GatePass() {
    }

    @PrePersist
    public void prePersist() {

        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (status == null) {
            status = "PENDING";
        }
    }

    public Long getId() {
        return id;
    }

    public String getPassCode() {
        return passCode;
    }

    public void setPassCode(String passCode) {
        this.passCode = passCode;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public LocalDateTime getOutTime() {
        return outTime;
    }

    public void setOutTime(LocalDateTime outTime) {
        this.outTime = outTime;
    }

    public LocalDateTime getExpectedReturnTime() {
        return expectedReturnTime;
    }

    public void setExpectedReturnTime(
            LocalDateTime expectedReturnTime) {

        this.expectedReturnTime = expectedReturnTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(LocalDateTime approvedAt) {
        this.approvedAt = approvedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    public String getWardenRemarks() {
        return wardenRemarks;
    }

    public void setWardenRemarks(String wardenRemarks) {
        this.wardenRemarks = wardenRemarks;
    }
}