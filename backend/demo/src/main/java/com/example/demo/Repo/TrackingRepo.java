package com.example.demo.Repo;

import com.example.demo.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TrackingRepo extends JpaRepository<Tracking, Integer> {

    // Method hiện tại
    List<Tracking> findByUserId(Integer userId);

    // Method mới - Top 3 triggers
    @Query(value = "SELECT trigger_value " +
            "FROM tracking " +
            "WHERE user_id = :userId " +
            "AND trigger_value IS NOT NULL " +
            "AND trigger_value != '' " +
            "GROUP BY trigger_value " +
            "ORDER BY COUNT(*) DESC " +
            "LIMIT 3",
            nativeQuery = true)
    List<String> findTop3Triggers(@Param("userId") Integer userId);

    @Query(value = "SELECT * FROM tracking WHERE user_id = :userId AND date BETWEEN :startDate AND :endDate", nativeQuery = true)
    List<Tracking> findByUserIdAndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);
}