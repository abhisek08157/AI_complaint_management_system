package com.abhisek.management.config;

import com.abhisek.management.entity.User;
import com.abhisek.management.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            /*
             * ADMIN
             */
            if (!userRepository
                    .existsByEmail("admin@campus.com")) {

                User admin = new User(
                        "Admin User",
                        "admin@campus.com",
                        passwordEncoder.encode(
                                "admin123"
                        ),
                        "ADMIN"
                );

                userRepository.save(admin);
            }

            /*
             * STAFF
             */
            if (!userRepository
                    .existsByEmail("staff@campus.com")) {

                User staff = new User(
                        "Default Staff",
                        "staff@campus.com",
                        passwordEncoder.encode(
                                "staff123"
                        ),
                        "STAFF",
                        "GENERAL"
                );

                userRepository.save(staff);
            }

            /*
             * STUDENT
             */
            if (!userRepository
                    .existsByEmail("student@campus.com")) {

                User student = new User(
                        "Default Student",
                        "student@campus.com",
                        passwordEncoder.encode(
                                "student123"
                        ),
                        "STUDENT"
                );

                userRepository.save(student);
            }
            if (!userRepository.existsByEmail("warden@campus.com")) {

                User warden = new User(
                        "Hostel Warden",
                        "warden@campus.com",
                        passwordEncoder.encode("warden123"),
                        "HOSTEL_WARDEN",
                        "HOSTEL"
                );

                userRepository.save(warden);
            }

            if (!userRepository.existsByEmail("security@campus.com")) {

                User security = new User(
                        "Security Officer",
                        "security@campus.com",
                        passwordEncoder.encode("security123"),
                        "SECURITY",
                        "SECURITY"
                );

                userRepository.save(security);
            }

            /*
             * Development migration:
             *
             * If old users contain plaintext passwords,
             * convert them to BCrypt hashes.
             */
            userRepository.findAll()
                    .forEach(user -> {

                        String password =
                                user.getPassword();

                        if (password != null &&
                                !password.startsWith("$2a$") &&
                                !password.startsWith("$2b$") &&
                                !password.startsWith("$2y$")) {

                            user.setPassword(
                                    passwordEncoder.encode(
                                            password
                                    )
                            );

                            userRepository.save(user);
                        }
                    });
        };
    }
}