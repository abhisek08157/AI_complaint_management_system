
package com.abhisek.management.controller;

import com.abhisek.management.dto.FeePaymentRequest;
import com.abhisek.management.dto.FeePaymentResponse;
import com.abhisek.management.service.FeePaymentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fee-payments")
public class FeePaymentController {

    private final FeePaymentService feePaymentService;

    public FeePaymentController(FeePaymentService feePaymentService) {
        this.feePaymentService = feePaymentService;
    }

    // Student initiates a simulated online payment
    @PostMapping("/online-demo")
    @ResponseStatus(HttpStatus.CREATED)
    public FeePaymentResponse payOnlineDemo(
            @Valid @RequestBody FeePaymentRequest request) {
        return feePaymentService.payOnlineDemo(request);
    }

    // Admin or staff records an offline payment
    @PostMapping("/offline")
    @ResponseStatus(HttpStatus.CREATED)
    public FeePaymentResponse recordOfflinePayment(
            @Valid @RequestBody FeePaymentRequest request) {
        return feePaymentService.recordOfflinePayment(request);
    }

    // Student views their own payment history
    @GetMapping("/my")
    public List<FeePaymentResponse> getMyPaymentHistory() {
        return feePaymentService.getMyPaymentHistory();
    }

    // Student or admin views payment history for a fee record
    @GetMapping("/fee/{feeRecordId}")
    public List<FeePaymentResponse> getPaymentHistoryByFeeRecord(
            @PathVariable Long feeRecordId) {
        return feePaymentService.getPaymentHistoryByFeeRecord(
                feeRecordId
        );
    }
}
