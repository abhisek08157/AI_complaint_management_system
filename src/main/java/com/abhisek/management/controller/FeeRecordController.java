
package com.abhisek.management.controller;

import com.abhisek.management.dto.FeeRecordRequest;
import com.abhisek.management.dto.FeeRecordResponse;
import com.abhisek.management.service.FeeRecordService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fees")
public class FeeRecordController {

    private final FeeRecordService feeRecordService;

    public FeeRecordController(FeeRecordService feeRecordService) {
        this.feeRecordService = feeRecordService;
    }

    // Admin creates a fee record
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FeeRecordResponse createFeeRecord(
            @Valid @RequestBody FeeRecordRequest request) {
        return feeRecordService.createFeeRecord(request);
    }

    // Student views their own fee records
    @GetMapping("/my")
    public List<FeeRecordResponse> getMyFees() {
        return feeRecordService.getMyFees();
    }

    // Admin views all fee records
    @GetMapping
    public List<FeeRecordResponse> getAllFees() {
        return feeRecordService.getAllFees();
    }

    // Admin views fee records belonging to one student
    @GetMapping("/student/{studentId}")
    public List<FeeRecordResponse> getFeesByStudent(
            @PathVariable Long studentId) {
        return feeRecordService.getFeesByStudent(studentId);
    }

    // Student or admin views a single fee record
    @GetMapping("/{id}")
    public FeeRecordResponse getFeeById(@PathVariable Long id) {
        return feeRecordService.getFeeById(id);
    }
}
