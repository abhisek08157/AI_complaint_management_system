// src/main/java/com/abhisek/management/controller/AuthController.java
package com.abhisek.management.controller;

import com.abhisek.management.dto.LoginResponse;
import com.abhisek.management.dto.LoginRequest;
import com.abhisek.management.dto.RegisterRequest;
import com.abhisek.management.service.AuthService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")   // <-- new: full path becomes POST /api/auth/login
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}