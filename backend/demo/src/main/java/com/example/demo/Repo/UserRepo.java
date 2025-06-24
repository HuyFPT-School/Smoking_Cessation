package com.example.demo.Repo;


import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@EnableJpaRepositories
@Repository
public interface UserRepo extends JpaRepository<User,Integer> {
    User findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);

    // Tổng số người dùng trong hệ thống
    long countByRole(Role role);


    // Đếm số user tạo trong khoảng thời gian cụ thể
    long countByRoleAndCreateAtBetween(Role role, LocalDateTime start, LocalDateTime end);
}
