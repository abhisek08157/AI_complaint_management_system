
package com.abhisek.management.service;

import com.abhisek.management.dto.MessMenuRequest;
import com.abhisek.management.dto.MessMenuResponse;
import com.abhisek.management.entity.MessMenu;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.MessMenuRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MessMenuService {

    private final MessMenuRepository messMenuRepository;
    private final CurrentUserService currentUserService;

    public MessMenuService(
            MessMenuRepository messMenuRepository,
            CurrentUserService currentUserService) {

        this.messMenuRepository = messMenuRepository;
        this.currentUserService = currentUserService;
    }

    // ADMIN / HOSTEL WARDEN - CREATE MENU
    @Transactional
    public MessMenuResponse createMenu(MessMenuRequest request) {

        User currentUser = currentUserService.getCurrentUser();
        validateManagerRole(currentUser);
        validateRequest(request);

        LocalDate date = request.getMenuDate();
        String mealType = normalizeMealType(request.getMealType());

        if (messMenuRepository.existsByMenuDateAndMealType(
                date, mealType)) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "A menu already exists for this date and meal"
            );
        }

        MessMenu menu = new MessMenu();
        menu.setMenuDate(date);
        menu.setMealType(mealType);
        menu.setItems(request.getItems().trim());
        menu.setSpecialNote(normalizeNote(request.getSpecialNote()));
        menu.setCreatedBy(currentUser);

        return new MessMenuResponse(
                messMenuRepository.save(menu)
        );
    }

    // AUTHENTICATED USERS - VIEW MENU FOR A DATE
    @Transactional(readOnly = true)
    public List<MessMenuResponse> getMenuByDate(LocalDate date) {

        currentUserService.getCurrentUser();

        if (date == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Menu date is required"
            );
        }

        return messMenuRepository
                .findByMenuDateOrderByMealTypeAsc(date)
                .stream()
                .map(MessMenuResponse::new)
                .toList();
    }

    // AUTHENTICATED USERS - VIEW MENU FOR A DATE RANGE
    @Transactional(readOnly = true)
    public List<MessMenuResponse> getMenuBetweenDates(
            LocalDate startDate,
            LocalDate endDate) {

        currentUserService.getCurrentUser();

        if (startDate == null || endDate == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Start date and end date are required"
            );
        }

        if (startDate.isAfter(endDate)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Start date cannot be after end date"
            );
        }

        return messMenuRepository
                .findByMenuDateBetweenOrderByMenuDateAscMealTypeAsc(
                        startDate, endDate)
                .stream()
                .map(MessMenuResponse::new)
                .toList();
    }

    // ADMIN / HOSTEL WARDEN - UPDATE MENU
    @Transactional
    public MessMenuResponse updateMenu(
            Long id,
            MessMenuRequest request) {

        User currentUser = currentUserService.getCurrentUser();
        validateManagerRole(currentUser);
        validateRequest(request);

        MessMenu menu = messMenuRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Mess menu not found"
                ));

        LocalDate date = request.getMenuDate();
        String mealType = normalizeMealType(request.getMealType());

        boolean changedKey =
                !menu.getMenuDate().equals(date)
                || !menu.getMealType().equals(mealType);

        if (changedKey
                && messMenuRepository.existsByMenuDateAndMealType(
                        date, mealType)) {

            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "A menu already exists for this date and meal"
            );
        }

        menu.setMenuDate(date);
        menu.setMealType(mealType);
        menu.setItems(request.getItems().trim());
        menu.setSpecialNote(normalizeNote(request.getSpecialNote()));

        return new MessMenuResponse(
                messMenuRepository.save(menu)
        );
    }

    // ADMIN / HOSTEL WARDEN - DELETE MENU
    @Transactional
    public void deleteMenu(Long id) {

        User currentUser = currentUserService.getCurrentUser();
        validateManagerRole(currentUser);

        MessMenu menu = messMenuRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Mess menu not found"
                ));

        messMenuRepository.delete(menu);
    }

    private void validateManagerRole(User user) {

        if (!"ADMIN".equalsIgnoreCase(user.getRole())
                && !"HOSTEL_WARDEN".equalsIgnoreCase(user.getRole())) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admin or hostel warden can manage mess menus"
            );
        }
    }

    private void validateRequest(MessMenuRequest request) {

        if (request == null
                || request.getMenuDate() == null
                || request.getMealType() == null
                || request.getMealType().isBlank()
                || request.getItems() == null
                || request.getItems().isBlank()) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Menu date, meal type and items are required"
            );
        }

        if (request.getItems().trim().length() > 3000) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Menu items cannot exceed 3000 characters"
            );
        }

        if (request.getSpecialNote() != null
                && request.getSpecialNote().length() > 1000) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Special note cannot exceed 1000 characters"
            );
        }

        normalizeMealType(request.getMealType());
    }

    private String normalizeMealType(String mealType) {

        String normalized = mealType.trim().toUpperCase();

        if (!List.of(
                "BREAKFAST",
                "LUNCH",
                "SNACKS",
                "DINNER"
        ).contains(normalized)) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Meal type must be BREAKFAST, LUNCH, SNACKS or DINNER"
            );
        }

        return normalized;
    }

    private String normalizeNote(String note) {

        if (note == null || note.isBlank()) {
            return null;
        }

        return note.trim();
    }
}
