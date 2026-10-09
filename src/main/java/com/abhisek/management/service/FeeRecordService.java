
package com.abhisek.management.service;

import com.abhisek.management.dto.FeeRecordRequest;
import com.abhisek.management.dto.FeeRecordResponse;
import com.abhisek.management.entity.FeeRecord;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.FeeRecordRepository;
import com.abhisek.management.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FeeRecordService {

    private final FeeRecordRepository feeRecordRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public FeeRecordService(
            FeeRecordRepository feeRecordRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService) {
        this.feeRecordRepository = feeRecordRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public FeeRecordResponse createFeeRecord(FeeRecordRequest request) {

        requireAdmin();

        if (request.getStudentId() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Student ID is required"
            );
        }

        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"
                ));

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Fee records can only be assigned to students"
            );
        }

        if (request.getTotalAmount() == null
                || request.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Total amount must be greater than zero"
            );
        }

        if (request.getDueDate() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Due date is required"
            );
        }

        if (request.getFeeType() == null
                || request.getFeeType().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Fee type is required"
            );
        }

        if (request.getAcademicYear() == null
                || request.getAcademicYear().isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Academic year is required"
            );
        }

        FeeRecord feeRecord = new FeeRecord();
        feeRecord.setStudent(student);
        feeRecord.setFeeType(request.getFeeType().trim());
        feeRecord.setTotalAmount(request.getTotalAmount());
        feeRecord.setPaidAmount(BigDecimal.ZERO);
        feeRecord.setDueDate(request.getDueDate());
        feeRecord.setAcademicYear(request.getAcademicYear().trim());
        feeRecord.setStatus("PENDING");

        return new FeeRecordResponse(
                feeRecordRepository.save(feeRecord)
        );
    }

    @Transactional(readOnly = true)
    public List<FeeRecordResponse> getMyFees() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can view their own fee records"
            );
        }

        return feeRecordRepository
                .findByStudentOrderByDueDateAsc(student)
                .stream()
                .map(FeeRecordResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FeeRecordResponse> getAllFees() {

        requireAdmin();

        return feeRecordRepository
                .findAllByOrderByDueDateAsc()
                .stream()
                .map(FeeRecordResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public FeeRecordResponse getFeeById(Long id) {

        User currentUser = currentUserService.getCurrentUser();

        FeeRecord feeRecord = feeRecordRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Fee record not found"
                ));

        boolean isAdmin = "ADMIN".equalsIgnoreCase(
                String.valueOf(currentUser.getRole()));

        boolean isOwner = feeRecord.getStudent().getId()
                .equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to view this fee record"
            );
        }

        return new FeeRecordResponse(feeRecord);
    }

    @Transactional(readOnly = true)
    public List<FeeRecordResponse> getFeesByStudent(Long studentId) {

        requireAdmin();

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"
                ));

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "The selected user is not a student"
            );
        }

        return feeRecordRepository
                .findByStudentOrderByDueDateAsc(student)
                .stream()
                .map(FeeRecordResponse::new)
                .toList();
    }

    private void requireAdmin() {

        User user = currentUserService.getCurrentUser();

        if (!"ADMIN".equalsIgnoreCase(
                String.valueOf(user.getRole()))) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can manage fee records"
            );
        }
    }
}
