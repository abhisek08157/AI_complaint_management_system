
package com.abhisek.management.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public class FeePaymentRequest {

    @NotNull(message = "Fee record ID is required")
    private Long feeRecordId;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(
            value = "0.01",
            message = "Payment amount must be greater than zero"
    )
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    @Pattern(
            regexp = "(?i)ONLINE|OFFLINE",
            message = "Payment method must be ONLINE or OFFLINE"
    )
    private String paymentMethod;

    public FeePaymentRequest() {
    }

    public Long getFeeRecordId() {
        return feeRecordId;
    }

    public void setFeeRecordId(Long feeRecordId) {
        this.feeRecordId = feeRecordId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
