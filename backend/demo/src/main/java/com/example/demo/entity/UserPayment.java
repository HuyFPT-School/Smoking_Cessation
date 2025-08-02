package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_payments")
public class UserPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "payment_type", nullable = false)
    private String paymentType; // "DIRECT_CHAT"

    @Column(name = "amount", nullable = false)
    private Integer amount; // Amount in VND

    @Column(name = "vnp_txn_ref", unique = true)
    private String vnpTxnRef; // VNPay transaction reference

    @Column(name = "vnp_transaction_no")
    private String vnpTransactionNo; // VNPay transaction number

    @Column(name = "payment_status", nullable = false)
    private String paymentStatus; // "PENDING", "SUCCESS", "FAILED"

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public UserPayment() {
        this.createdAt = LocalDateTime.now();
    }

    public UserPayment(Long userId, String paymentType, Integer amount, String vnpTxnRef) {
        this();
        this.userId = userId;
        this.paymentType = paymentType;
        this.amount = amount;
        this.vnpTxnRef = vnpTxnRef;
        this.paymentStatus = "PENDING";
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public Integer getAmount() {
        return amount;
    }

    public void setAmount(Integer amount) {
        this.amount = amount;
    }

    public String getVnpTxnRef() {
        return vnpTxnRef;
    }

    public void setVnpTxnRef(String vnpTxnRef) {
        this.vnpTxnRef = vnpTxnRef;
    }

    public String getVnpTransactionNo() {
        return vnpTransactionNo;
    }

    public void setVnpTransactionNo(String vnpTransactionNo) {
        this.vnpTransactionNo = vnpTransactionNo;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
        if ("SUCCESS".equals(paymentStatus)) {
            this.paymentDate = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
