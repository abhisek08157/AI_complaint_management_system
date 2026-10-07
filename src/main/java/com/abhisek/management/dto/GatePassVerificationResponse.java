package com.abhisek.management.dto;

public class GatePassVerificationResponse {

    private boolean valid;
    private String message;
    private String action;
    private GatePassResponse gatePass;

    public GatePassVerificationResponse(
            boolean valid,
            String message,
            String action,
            GatePassResponse gatePass) {

        this.valid = valid;
        this.message = message;
        this.action = action;
        this.gatePass = gatePass;
    }

    public boolean isValid() {
        return valid;
    }

    public String getMessage() {
        return message;
    }

    public String getAction() {
        return action;
    }

    public GatePassResponse getGatePass() {
        return gatePass;
    }
}