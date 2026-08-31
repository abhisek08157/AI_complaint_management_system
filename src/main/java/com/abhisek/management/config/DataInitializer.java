// src/main/java/com/abhisek/management/config/DataInitializer.java
package com.abhisek.management.config;

import com.abhisek.management.entity.User;
import com.abhisek.management.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(UserRepository userRepository) {
        return args -> {

            if (!userRepository.existsByEmail("admin@campus.com")) {
                userRepository.save(new User("Admin User", "admin@campus.com", "admin123", "ADMIN"));
            }

            if (!userRepository.existsByEmail("staff@campus.com")) {
                userRepository.save(new User("Default Staff", "staff@campus.com", "staff123", "STAFF"));
            }

            if (!userRepository.existsByEmail("student@campus.com")) {
                userRepository.save(new User("Default Student", "student@campus.com", "student123", "STUDENT"));
            }
        };
    }
}