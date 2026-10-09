
package com.abhisek.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class MessMenuRequest {

    @NotNull(message = "Menu date is required")
    private LocalDate menuDate;

    @NotBlank(message = "Meal type is required")
    @Pattern(
        regexp = "(?i)BREAKFAST|LUNCH|SNACKS|DINNER",
        message = "Meal type must be BREAKFAST, LUNCH, SNACKS or DINNER"
    )
    private String mealType;

    @NotBlank(message = "Menu items are required")
    @Size(max = 3000, message = "Menu items cannot exceed 3000 characters")
    private String items;

    @Size(max = 1000, message = "Special note cannot exceed 1000 characters")
    private String specialNote;

    public LocalDate getMenuDate() {
        return menuDate;
    }

    public void setMenuDate(LocalDate menuDate) {
        this.menuDate = menuDate;
    }

    public String getMealType() {
        return mealType;
    }

    public void setMealType(String mealType) {
        this.mealType = mealType;
    }

    public String getItems() {
        return items;
    }

    public void setItems(String items) {
        this.items = items;
    }

    public String getSpecialNote() {
        return specialNote;
    }

    public void setSpecialNote(String specialNote) {
        this.specialNote = specialNote;
    }
}
