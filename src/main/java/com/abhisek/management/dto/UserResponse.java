package com.abhisek.management.dto;

import com.abhisek.management.entity.User;

public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String role;
    private String specialization;

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.specialization = user.getSpecialization();
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getSpecialization() { return specialization; }
}