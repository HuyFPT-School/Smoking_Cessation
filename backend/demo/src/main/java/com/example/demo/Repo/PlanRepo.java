package com.example.demo.Repo;

import com.example.demo.entity.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanRepo extends JpaRepository<Plan, Long> {
    Optional<Plan> findByUserId(String userId);
}
