
package com.abhisek.management.dto;

import com.abhisek.management.entity.MessMenu;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class MessMenuResponse {

    private Long id;
    private LocalDate menuDate;
    private String mealType;
    private String items;
    private String specialNote;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public MessMenuResponse(MessMenu menu) {
        this.id = menu.getId();
        this.menuDate = menu.getMenuDate();
        this.mealType = menu.getMealType();
        this.items = menu.getItems();
        this.specialNote = menu.getSpecialNote();

        if (menu.getCreatedBy() != null) {
            this.createdById = menu.getCreatedBy().getId();
            this.createdByName = menu.getCreatedBy().getName();
        }

        this.createdAt = menu.getCreatedAt();
        this.updatedAt = menu.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public LocalDate getMenuDate() {
        return menuDate;
    }

    public String getMealType() {
        return mealType;
    }

    public String getItems() {
        return items;
    }

    public String getSpecialNote() {
        return specialNote;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
