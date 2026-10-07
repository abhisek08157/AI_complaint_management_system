package com.abhisek.management.dto;

import com.abhisek.management.entity.GatePass;

import java.time.LocalDateTime;

public class GatePassResponse {

    private Long id;
    private String passCode;
    private String qrToken;

    private String reason;
    private String destination;

    private LocalDateTime outTime;
    private LocalDateTime expectedReturnTime;

    private String status;
    private String wardenRemarks;

    public String getWardenRemarks() {
		return wardenRemarks;
	}

	public void setWardenRemarks(String wardenRemarks) {
		this.wardenRemarks = wardenRemarks;
	}

	private Long studentId;
    private String studentName;
    private String studentEmail;

    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;

    public GatePassResponse(GatePass gatePass) {
    	
    	this.wardenRemarks = gatePass.getWardenRemarks();

        this.id = gatePass.getId();
        this.passCode = gatePass.getPassCode();
        this.qrToken = gatePass.getQrToken();

        this.reason = gatePass.getReason();
        this.destination = gatePass.getDestination();

        this.outTime = gatePass.getOutTime();
        this.expectedReturnTime =
                gatePass.getExpectedReturnTime();

        this.status = gatePass.getStatus();

        if (gatePass.getStudent() != null) {

            this.studentId =
                    gatePass.getStudent().getId();

            this.studentName =
                    gatePass.getStudent().getName();

            this.studentEmail =
                    gatePass.getStudent().getEmail();
        }

        this.createdAt =
                gatePass.getCreatedAt();

        this.approvedAt =
                gatePass.getApprovedAt();

        this.expiresAt =
                gatePass.getExpiresAt();
    }

    public Long getId() {
        return id;
    }

    public String getPassCode() {
        return passCode;
    }

    public String getQrToken() {
        return qrToken;
    }

    public String getReason() {
        return reason;
    }

    public String getDestination() {
        return destination;
    }

    public LocalDateTime getOutTime() {
        return outTime;
    }

    public LocalDateTime getExpectedReturnTime() {
        return expectedReturnTime;
    }

    public String getStatus() {
        return status;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
}