package com.abhisek.management.dto;

public class CampusRequestCreate {

    private String requestType;
    private String description;

    public CampusRequestCreate() {
    }

    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}