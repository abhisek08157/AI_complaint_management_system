// src/main/java/com/abhisek/management/service/AuthService.java
package com.abhisek.management.service;

import com.abhisek.management.dto.LoginRequest;
import com.abhisek.management.dto.LoginResponse;
import com.abhisek.management.dto.RegisterRequest;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service // tells Spring: "this class contains business logic, manage it for me"
public class AuthService {

    private static final List<String> VALID_ROLES = List.of("STUDENT", "ADMIN", "STAFF");

    private final UserRepository userRepository;

    // Spring automatically gives us a working UserRepository here — this is called
    // "dependency injection". We don't create it ourselves, Spring hands it to us.
    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse register(RegisterRequest request) {

        // --- basic validation ---
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Name is required");
        }
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        String role = request.getRole() == null ? "" : request.getRole().toUpperCase();
        if (!VALID_ROLES.contains(role)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be one of " + VALID_ROLES);
        }

        // --- check for duplicate email ---
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }

        // --- save the new user ---
        User user = new User(request.getName(), request.getEmail(), request.getPassword(), role);
        User saved = userRepository.save(user);

        // return a clean response (no password included)
        return new LoginResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole(),
                "Registration successful"
                
        
                
        );    
    }
    
    public LoginResponse login(LoginRequest request) {

        // find the user by email — if not found, throw an error
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        // check password matches exactly
        if (!user.getPassword().equals(request.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                "Login successful"
        );
    }
}