package com.abhisek.management.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(
                        corsConfigurationSource()
                ))

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // ========================================================
                        // AUTHENTICATION
                        // ========================================================

                        .requestMatchers(
                                "/api/auth/**"
                        ).permitAll()

                        // ========================================================
                        // HEALTH
                        // ========================================================

                        .requestMatchers(
                                "/api/health"
                        ).permitAll()

                        // ========================================================
                        // ADMIN APIs
                        // ========================================================
                        .requestMatchers("/api/analytics/**")
                        .hasRole("ADMIN")

                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")
                        
                        // ========================================================
                        // STAFF APIs
                        // ========================================================

                        .requestMatchers(
                                "/api/staff/**"
                        ).hasAnyRole(
                                "STAFF",
                                "ADMIN"
                        )

                        // ========================================================
                        // COMPLAINT CREATION
                        // ========================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/complaints"
                        ).hasRole("STUDENT")

                        // ========================================================
                        // OTHER COMPLAINT APIs
                        // ========================================================

                        .requestMatchers(
                                "/api/complaints/**"
                        ).authenticated()

                        // ========================================================
                        // CAMPUS REQUESTS - STUDENT
                        // ========================================================

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/requests"
                        ).hasRole("STUDENT")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/requests/my"
                        ).hasRole("STUDENT")

                        // ========================================================
                        // CAMPUS REQUESTS - ADMIN
                        // ========================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/requests"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/requests/**"
                        ).hasRole("ADMIN")

                        // ========================================================
                        // CAMPUS REQUEST - AUTHENTICATED ACCESS
                        // ========================================================

                        .requestMatchers(
                                "/api/requests/**"
                        ).authenticated()
                        
                     // ========================================================
                     // GATE PASS - STUDENT
                     // ========================================================

                     .requestMatchers(
                             HttpMethod.POST,
                             "/api/gate-passes"
                     ).hasRole("STUDENT")

                     .requestMatchers(
                             HttpMethod.GET,
                             "/api/gate-passes/my"
                     ).hasRole("STUDENT")

                     // ========================================================
                     // GATE PASS - HOSTEL WARDEN
                     // ========================================================

                     .requestMatchers(
                             HttpMethod.GET,
                             "/api/gate-passes/warden"
                     ).hasRole("HOSTEL_WARDEN")

                     .requestMatchers(
                             HttpMethod.PUT,
                             "/api/gate-passes/*/decision"
                     ).hasRole("HOSTEL_WARDEN")

                     // ========================================================
                     // GATE PASS - SECURITY
                     // ========================================================

                     .requestMatchers(
                             HttpMethod.POST,
                             "/api/gate-passes/verify"
                     ).hasRole("SECURITY")

                     .requestMatchers(
                             HttpMethod.GET,
                             "/api/gate-passes/*/logs"
                     ).hasRole("SECURITY")

                     // ========================================================
                     // GATE PASS - ADMIN
                     // ========================================================

                     .requestMatchers(
                             HttpMethod.GET,
                             "/api/gate-passes/admin"
                     ).hasRole("ADMIN")

                     // ========================================================
                     // GATE PASS - OTHER AUTHENTICATED REQUESTS
                     // ========================================================

                     .requestMatchers(
                             "/api/gate-passes/**"
                     ).authenticated()
                     
                  // =========================
                  // ANNOUNCEMENT RULES
                  // =========================

                  // Create announcement
                  .requestMatchers(HttpMethod.POST, "/api/announcements")
                          .hasAnyRole("ADMIN", "STAFF", "HOSTEL_WARDEN")

                  // View my announcements
                  .requestMatchers(HttpMethod.GET, "/api/announcements/my")
                          .hasAnyRole("ADMIN", "STAFF", "HOSTEL_WARDEN")

                  // Admin can view all announcements
                  .requestMatchers(HttpMethod.GET, "/api/announcements/admin")
                          .hasRole("ADMIN")

                  // Update announcement
                  .requestMatchers(HttpMethod.PUT, "/api/announcements/*")
                          .hasAnyRole("ADMIN", "STAFF", "HOSTEL_WARDEN")

                  // Delete announcement
                  .requestMatchers(HttpMethod.DELETE, "/api/announcements/*")
                          .hasAnyRole("ADMIN", "STAFF", "HOSTEL_WARDEN")

                  // Students, staff, wardens, security and admin can view published announcements
                  .requestMatchers(HttpMethod.GET, "/api/announcements")
                          .authenticated()

                  // View individual announcement
                  .requestMatchers(HttpMethod.GET, "/api/announcements/*")
                          .authenticated()

                  // Protect any remaining announcement endpoints
                  .requestMatchers("/api/announcements/**")
                          .authenticated()
                          .requestMatchers("/api/warden/**")
                          .hasRole("HOSTEL_WARDEN")
                          .requestMatchers("/api/security/**").hasRole("SECURITY")
                          .requestMatchers("/api/student/**").hasRole("STUDENT")
                          .requestMatchers("/api/notifications/**").authenticated()

                          // ========================================================
                          // ATTENDANCE MANAGEMENT
                          // ========================================================

                          // Staff can mark attendance
                          .requestMatchers(
                                  HttpMethod.POST,
                                  "/api/attendance"
                          ).hasRole("STAFF")

                          // Students can view their own attendance
                          .requestMatchers(
                                  HttpMethod.GET,
                                  "/api/attendance/my"
                          ).hasRole("STUDENT")

                          // Staff and admin can view a student's attendance
                          .requestMatchers(
                                  HttpMethod.GET,
                                  "/api/attendance/student/*"
                          ).hasAnyRole("STAFF", "ADMIN")

                          // Staff and admin can view attendance by subject/date
                          .requestMatchers(
                                  HttpMethod.GET,
                                  "/api/attendance/by-subject"
                          ).hasAnyRole("STAFF", "ADMIN")

                          // MESS MENU - CREATE
                          .requestMatchers(
                                  HttpMethod.POST,
                                  "/api/mess-menu"
                          ).hasAnyRole("ADMIN", "HOSTEL_WARDEN")

                          // MESS MENU - UPDATE
                          .requestMatchers(
                                  HttpMethod.PUT,
                                  "/api/mess-menu/*"
                          ).hasAnyRole("ADMIN", "HOSTEL_WARDEN")

                          // MESS MENU - DELETE
                          .requestMatchers(
                                  HttpMethod.DELETE,
                                  "/api/mess-menu/*"
                          ).hasAnyRole("ADMIN", "HOSTEL_WARDEN")

                          // MESS MENU - VIEW
                          .requestMatchers(
                                  HttpMethod.GET,
                                  "/api/mess-menu/**"
                          ).authenticated()

.requestMatchers(HttpMethod.POST, "/api/mess-feedback")
    .hasRole("STUDENT")

.requestMatchers(HttpMethod.GET, "/api/mess-feedback/my")
    .hasRole("STUDENT")

.requestMatchers(
        HttpMethod.GET,
        "/api/mess-feedback/by-date",
        "/api/mess-feedback/by-meal"
).hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/mess-feedback")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.POST, "/api/timetable")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.PUT, "/api/timetable/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.DELETE, "/api/timetable/*")
    .hasRole("ADMIN")

.requestMatchers(
        HttpMethod.GET,
        "/api/timetable/section",
        "/api/timetable/section/day"
)
    .hasAnyRole("STUDENT", "STAFF", "ADMIN")

.requestMatchers(HttpMethod.GET, "/api/timetable/faculty")
    .hasAnyRole("STAFF", "ADMIN")

.requestMatchers(HttpMethod.POST, "/api/fees")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/fees/my")
    .hasRole("STUDENT")

.requestMatchers(HttpMethod.GET, "/api/fees/student/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/fees")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/fees/*")
    .hasAnyRole("ADMIN", "STUDENT")

.requestMatchers(HttpMethod.POST, "/api/fee-payments/online-demo")
    .hasRole("STUDENT")

.requestMatchers(HttpMethod.POST, "/api/fee-payments/offline")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(HttpMethod.GET, "/api/fee-payments/my")
    .hasRole("STUDENT")

.requestMatchers(HttpMethod.GET, "/api/fee-payments/fee/*")
    .hasAnyRole("ADMIN", "STUDENT")







                        // ========================================================
                        // EVERYTHING ELSE
                        // ========================================================

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}