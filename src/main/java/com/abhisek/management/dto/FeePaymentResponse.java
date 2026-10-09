
package com.abhisek.management.dto;

import com.abhisek.management.entity.FeePayment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FeePaymentResponse {

    private Long id;
    private Long feeRecordId;
    private Long studentId;
    private String studentName;
    private String feeType;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionReference;
    private String remarks;
    private LocalDateTime createdAt;

    public FeePaymentResponse() {
    }

    public FeePaymentResponse(FeePayment payment) {

        this.id = payment.getId();

        if (payment.getFeeRecord() != null) {
            this.feeRecordId = payment.getFeeRecord().getId();
            this.feeType = payment.getFeeRecord().getFeeType();

            if (payment.getFeeRecord().getStudent() != null) {
                this.studentId =
                        payment.getFeeRecord().getStudent().getId();

                this.studentName =
                        payment.getFeeRecord().getStudent().getName();
            }
        }

        this.amount = payment.getAmount();
        this.paymentMethod = payment.getPaymentMethod();
        this.paymentStatus = payment.getPaymentStatus();
        this.transactionReference =
                payment.getTransactionReference();
        this.remarks = payment.getRemarks();
        this.createdAt = payment.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public Long getFeeRecordId() {
        return feeRecordId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getFeeType() {
        return feeType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public String getRemarks() {
        return remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
