package com.example.demo.Repo;

import com.example.demo.entity.UserPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPaymentRepository extends JpaRepository<UserPayment, Long> {
    
    // Find payment by VNPay transaction reference
    Optional<UserPayment> findByVnpTxnRef(String vnpTxnRef);
    
    // Find all payments by user ID
    List<UserPayment> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Check if user has successful Direct Chat payment
    @Query("SELECT COUNT(up) > 0 FROM UserPayment up WHERE up.userId = :userId AND up.paymentType = 'DIRECT_CHAT' AND up.paymentStatus = 'SUCCESS'")
    boolean hasSuccessfulDirectChatPayment(@Param("userId") Long userId);
    
    // Get latest successful Direct Chat payment for user
    @Query("SELECT up FROM UserPayment up WHERE up.userId = :userId AND up.paymentType = 'DIRECT_CHAT' AND up.paymentStatus = 'SUCCESS' ORDER BY up.paymentDate DESC")
    Optional<UserPayment> findLatestSuccessfulDirectChatPayment(@Param("userId") Long userId);
    
    // Find payments by status
    List<UserPayment> findByPaymentStatus(String paymentStatus);
    
    // Delete all payments by user ID
    void deleteByUserId(Long userId);
}
