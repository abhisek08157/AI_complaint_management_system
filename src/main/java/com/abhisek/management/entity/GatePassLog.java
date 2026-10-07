package com.abhisek.management.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "gate_pass_logs")
public class GatePassLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "gate_pass_id",
            nullable = false
    )
    private GatePass gatePass;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private LocalDateTime scannedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    public GatePassLog() {
    }

    @PrePersist
    public void prePersist() {

        if (scannedAt == null) {
            scannedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public GatePass getGatePass() {
        return gatePass;
    }

    public void setGatePass(GatePass gatePass) {
        this.gatePass = gatePass;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }
}