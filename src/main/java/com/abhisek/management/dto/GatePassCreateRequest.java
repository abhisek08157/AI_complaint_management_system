package com.abhisek.management.dto;

import java.time.LocalDateTime;

public class GatePassCreateRequest {

    private String reason;
    private String destination;
    private LocalDateTime outTime;
    private LocalDateTime expectedReturnTime;

    public GatePassCreateRequest() {
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
}