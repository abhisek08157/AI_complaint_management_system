package com.abhisek.management.service;

import com.abhisek.management.dto.FeePaymentRequest;
import com.abhisek.management.dto.FeePaymentResponse;
import com.abhisek.management.entity.FeePayment;
import com.abhisek.management.entity.FeeRecord;
import com.abhisek.management.entity.User;
import com.abhisek.management.exception.ApiException;
import com.abhisek.management.repository.FeePaymentRepository;
import com.abhisek.management.repository.FeeRecordRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class FeePaymentService {

    private final FeePaymentRepository feePaymentRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final CurrentUserService currentUserService;

    public FeePaymentService(
            FeePaymentRepository feePaymentRepository,
            FeeRecordRepository feeRecordRepository,
            CurrentUserService currentUserService) {

        this.feePaymentRepository = feePaymentRepository;
        this.feeRecordRepository = feeRecordRepository;
        this.currentUserService = currentUserService;
    }

    // =========================
    // ONLINE DEMO PAYMENT
    // =========================

    @Transactional
    public FeePaymentResponse payOnlineDemo(FeePaymentRequest request) {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can initiate online demo payments"
            );
        }

        validateRequest(request);

        if (!"ONLINE".equalsIgnoreCase(request.getPaymentMethod())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Use ONLINE as the payment method for demo payments"
            );
        }

        // Lock the fee record within this transaction.
        FeeRecord feeRecord = getFeeRecordForUpdate(
                request.getFeeRecordId()
        );

        if (!feeRecord.getStudent().getId().equals(student.getId())) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You cannot pay another student's fee"
            );
        }

        BigDecimal remaining = getRemainingAmount(feeRecord);
        validateAmount(request.getAmount(), remaining);

        FeePayment payment = new FeePayment();
        payment.setFeeRecord(feeRecord);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("ONLINE");
        payment.setTransactionReference(
                "DEMO-" + UUID.randomUUID()
        );

        // Simulation only: this is not a real payment gateway.
        boolean successful =
                ThreadLocalRandom.current().nextInt(100) < 80;

        if (successful) {
            payment.setPaymentStatus("SUCCESS");
            payment.setRemarks(
                    "Demo payment successful; no real money charged"
            );

            feeRecord.setPaidAmount(
                    feeRecord.getPaidAmount().add(request.getAmount())
            );

            updateFeeStatus(feeRecord);
            feeRecordRepository.save(feeRecord);

        } else {
            payment.setPaymentStatus("FAILED");
            payment.setRemarks(
                    "Demo payment failed; no money charged"
            );
        }

        FeePayment savedPayment = feePaymentRepository.save(payment);

        return new FeePaymentResponse(savedPayment);
    }

    // =========================
    // RECORD OFFLINE PAYMENT
    // =========================

    @Transactional
    public FeePaymentResponse recordOfflinePayment(
            FeePaymentRequest request) {

        User adminOrStaff = currentUserService.getCurrentUser();

        requireAdminOrStaff(adminOrStaff);
        validateRequest(request);

        if (!"OFFLINE".equalsIgnoreCase(request.getPaymentMethod())) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Use OFFLINE as the payment method for offline records"
            );
        }

        // Lock the fee record within this transaction.
        FeeRecord feeRecord = getFeeRecordForUpdate(
                request.getFeeRecordId()
        );

        BigDecimal remaining = getRemainingAmount(feeRecord);
        validateAmount(request.getAmount(), remaining);

        FeePayment payment = new FeePayment();
        payment.setFeeRecord(feeRecord);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod("OFFLINE");
        payment.setPaymentStatus("SUCCESS");
        payment.setTransactionReference(
                "OFF-" + UUID.randomUUID()
        );
        payment.setRecordedBy(adminOrStaff);
        payment.setRemarks(
                "Offline payment recorded by college staff"
        );

        feeRecord.setPaidAmount(
                feeRecord.getPaidAmount().add(request.getAmount())
        );

        updateFeeStatus(feeRecord);

        feeRecordRepository.save(feeRecord);

        FeePayment savedPayment = feePaymentRepository.save(payment);

        return new FeePaymentResponse(savedPayment);
    }

    // =========================
    // MY PAYMENT HISTORY
    // =========================

    @Transactional(readOnly = true)
    public List<FeePaymentResponse> getMyPaymentHistory() {

        User student = currentUserService.getCurrentUser();

        if (!"STUDENT".equalsIgnoreCase(
                String.valueOf(student.getRole()))) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only students can view their payment history"
            );
        }

        return feePaymentRepository
                .findByFeeRecordStudentIdOrderByCreatedAtDesc(
                        student.getId()
                )
                .stream()
                .map(FeePaymentResponse::new)
                .toList();
    }

    // =========================
    // PAYMENT HISTORY BY FEE
    // =========================

    @Transactional(readOnly = true)
    public List<FeePaymentResponse> getPaymentHistoryByFeeRecord(
            Long feeRecordId) {

        User user = currentUserService.getCurrentUser();
        FeeRecord feeRecord = getFeeRecord(feeRecordId);

        boolean isAdmin = "ADMIN".equalsIgnoreCase(
                String.valueOf(user.getRole())
        );

        boolean isOwner = feeRecord.getStudent().getId()
                .equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "You cannot view this payment history"
            );
        }

        return feePaymentRepository
                .findByFeeRecordOrderByCreatedAtDesc(feeRecord)
                .stream()
                .map(FeePaymentResponse::new)
                .toList();
    }

    // =========================
    // FIND FEE RECORD
    // =========================

    private FeeRecord getFeeRecord(Long id) {

        return feeRecordRepository.findById(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Fee record not found"
                ));
    }

    // Fetch and lock a fee record for payment processing.
    // Call this only from a transactional payment method.
    private FeeRecord getFeeRecordForUpdate(Long id) {

        return feeRecordRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Fee record not found"
                ));
    }

    // =========================
    // VALIDATION
    // =========================

    private void validateRequest(FeePaymentRequest request) {

        if (request == null || request.getFeeRecordId() == null) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Fee record ID is required"
            );
        }

        if (request.getAmount() == null
                || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }
    }

    private BigDecimal getRemainingAmount(FeeRecord feeRecord) {

        BigDecimal remaining = feeRecord.getTotalAmount()
                .subtract(feeRecord.getPaidAmount());

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "This fee has already been fully paid"
            );
        }

        return remaining;
    }

    private void validateAmount(
            BigDecimal amount,
            BigDecimal remaining) {

        if (amount.compareTo(remaining) > 0) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount exceeds the remaining balance"
            );
        }
    }

    // =========================
    // UPDATE FEE STATUS
    // =========================

    private void updateFeeStatus(FeeRecord feeRecord) {

        if (feeRecord.getPaidAmount()
                .compareTo(feeRecord.getTotalAmount()) >= 0) {

            feeRecord.setStatus("PAID");

        } else if (feeRecord.getPaidAmount()
                .compareTo(BigDecimal.ZERO) > 0) {

            feeRecord.setStatus("PARTIALLY_PAID");

        } else {
            feeRecord.setStatus("PENDING");
        }
    }

    // =========================
    // ROLE VALIDATION
    // =========================

    private void requireAdminOrStaff(User user) {

        String role = String.valueOf(user.getRole());

        if (!"ADMIN".equalsIgnoreCase(role)
                && !"STAFF".equalsIgnoreCase(role)) {

            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Only admins or staff can record offline payments"
            );
        }
    }
}