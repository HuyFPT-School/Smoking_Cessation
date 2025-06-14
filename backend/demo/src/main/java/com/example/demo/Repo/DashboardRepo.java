package com.example.demo.Repo;

import com.example.demo.entity.Dashboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Optional;

public interface DashboardRepo extends JpaRepository<Dashboard, Long> {
    @Query("SELECT d FROM Dashboard d WHERE d.userId = :userId AND d.recordedDate = :recordedDate")
    Optional<Dashboard> findByUserIdAndRecordedDate(@Param("userId") Integer userId, @Param("recordedDate") LocalDate recordedDate);

    void deleteByUserIdAndRecordedDate(Integer userId, LocalDate recordedDate);
}