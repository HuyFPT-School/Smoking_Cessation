package com.example.demo.Repo;

import com.example.demo.entity.User;
import com.example.demo.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepo extends JpaRepository<UserProfile, Integer> {
    Optional<UserProfile> findByUserId(int userId);
    void deleteByUser(User user);

}
