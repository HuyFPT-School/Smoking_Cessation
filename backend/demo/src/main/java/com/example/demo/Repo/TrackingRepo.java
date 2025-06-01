package com.example.demo.Repo;

import com.example.demo.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingRepo extends JpaRepository<Tracking, Integer> {
    List<Tracking> findByUserId(int userId);
}
