// src/main/java/com/abhisek/management/exception/ApiException.java
package com.abhisek.management.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);       // the error message, e.g. "Email already registered"
        this.status = status; // the HTTP status, e.g. 409 CONFLICT
    }

    public HttpStatus getStatus() {
        return status;
    }
}