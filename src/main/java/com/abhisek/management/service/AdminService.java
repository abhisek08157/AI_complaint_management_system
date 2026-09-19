package com.abhisek.management.service;

import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository userRepository;

    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllStaff() {
        return userRepository.findByRole("STAFF");
    }

    public User updateStaffSpecialization(Long userId, String specialization) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff user not found"));

        if (!"STAFF".equalsIgnoreCase(user.getRole())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "User is not a STAFF member");
        }

        if (specialization == null || specialization.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Specialization cannot be empty");
        }

        // Store only single specialization entry
        String singleSpecialization = specialization.split(",")[0].trim();
        user.setSpecialization(singleSpecialization);

        return userRepository.save(user);
    }
}