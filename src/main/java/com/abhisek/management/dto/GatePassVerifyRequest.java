package com.abhisek.management.dto;

public class GatePassVerifyRequest {

    private String qrToken;
    private String action;

    public GatePassVerifyRequest() {
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}