package com.example.demo.service;

import com.example.demo.entity.UserPayment;
import com.example.demo.Repo.UserPaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserPaymentService {

    @Autowired
    private UserPaymentRepository userPaymentRepository;

    // Create new payment record
    public UserPayment createPayment(Long userId, String paymentType, Integer amount, String vnpTxnRef) {
        UserPayment payment = new UserPayment(userId, paymentType, amount, vnpTxnRef);
        return userPaymentRepository.save(payment);
    }

    // Update payment status when VNPay callback received
    public UserPayment updatePaymentStatus(String vnpTxnRef, String paymentStatus, String vnpTransactionNo) {
        Optional<UserPayment> paymentOpt = userPaymentRepository.findByVnpTxnRef(vnpTxnRef);
        if (paymentOpt.isPresent()) {
            UserPayment payment = paymentOpt.get();
            payment.setPaymentStatus(paymentStatus);
            if (vnpTransactionNo != null) {
                payment.setVnpTransactionNo(vnpTransactionNo);
            }
            return userPaymentRepository.save(payment);
        }
        return null;
    }

    // Check if user has access to Direct Chat
    public boolean hasDirectChatAccess(Long userId) {
        return userPaymentRepository.hasSuccessfulDirectChatPayment(userId);
    }

    // Get user's payment history
    public List<UserPayment> getUserPaymentHistory(Long userId) {
        return userPaymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Get latest successful Direct Chat payment
    public Optional<UserPayment> getLatestDirectChatPayment(Long userId) {
        return userPaymentRepository.findLatestSuccessfulDirectChatPayment(userId);
    }

    // Find payment by transaction reference
    public Optional<UserPayment> findByTxnRef(String vnpTxnRef) {
        return userPaymentRepository.findByVnpTxnRef(vnpTxnRef);
    }
}
