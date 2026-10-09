package com.abhisek.management.dto;

import com.abhisek.management.entity.GatePassLog;

import java.time.LocalDateTime;

public class GatePassLogResponse {

    private Long id;
    private String action;
    private LocalDateTime scannedAt;
    private String verifiedByName;
    private String verifiedByEmail;
    private String passCode;

    public GatePassLogResponse(GatePassLog log) {
        this.id = log.getId();
        this.action = log.getAction();
        this.scannedAt = log.getScannedAt();

        if (log.getVerifiedBy() != null) {
            this.verifiedByName = log.getVerifiedBy().getName();
            this.verifiedByEmail = log.getVerifiedBy().getEmail();
        }

        if (log.getGatePass() != null) {
            this.passCode = log.getGatePass().getPassCode();
        }
    }

    public Long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public LocalDateTime getScannedAt() {
        return scannedAt;
    }

    public String getVerifiedByName() {
        return verifiedByName;
    }

    public String getVerifiedByEmail() {
        return verifiedByEmail;
    }

    public String getPassCode() {
        return passCode;
    }
}