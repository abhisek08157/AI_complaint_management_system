package com.abhisek.management.service;

import com.abhisek.management.dto.LoginRequest;
import com.abhisek.management.dto.LoginResponse;
import com.abhisek.management.dto.RegisterRequest;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse register(
            RegisterRequest request) {

        if (request.getName() == null ||
                request.getName().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Name is required"
            );
        }

        if (request.getEmail() == null ||
                request.getEmail().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Email is required"
            );
        }

        if (request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Password is required"
            );
        }

        if (request.getPassword().length() < 6) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Password must contain at least 6 characters"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        if (userRepository.existsByEmail(email)) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        /*
         * Public registration creates STUDENT accounts only.
         *
         * ADMIN and STAFF accounts will be created
         * through protected administrative operations.
         */

        User user = new User(
                request.getName().trim(),
                email,
                passwordEncoder.encode(
                        request.getPassword()
                ),
                "STUDENT",
                null
        );

        User saved =
                userRepository.save(user);

        String token =
                jwtService.generateToken(
                        saved.getEmail(),
                        saved.getRole()
                );

        return new LoginResponse(
                saved.getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole(),
                token,
                "Registration successful"
        );
    }

    public LoginResponse login(
            LoginRequest request) {

        if (request.getEmail() == null ||
                request.getEmail().isBlank() ||
                request.getPassword() == null ||
                request.getPassword().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Email and password are required"
            );
        }

        String email =
                request.getEmail()
                        .trim()
                        .toLowerCase();

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow(() ->
                                new ApiException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid email or password"
                                )
                        );

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new ApiException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        String token =
                jwtService.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        return new LoginResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token,
                "Login successful"
        );
    }
}