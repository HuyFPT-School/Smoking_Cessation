package com.example.demo.Repo;

import com.example.demo.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    void deleteByUserId(Long userId); // nếu userId kiểu Long trong ChatMessage

    // Lấy lịch sử chat theo user ID
    List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);
    // Lấy 5 tin nhắn gần nhất để tạo context (sử dụng Spring Data naming convention)
    List<ChatMessage> findTop5ByUserIdOrderByCreatedAtDesc(Long userId);

    // Đếm số tin nhắn của user trong ngày (sử dụng date range thay vì DATE() function)
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.userId = :userId AND c.createdAt >= :startOfDay AND c.createdAt < :endOfDay")
    long countTodayMessagesByUserId(@Param("userId") Long userId, 
                                   @Param("startOfDay") Date startOfDay, 
                                   @Param("endOfDay") Date endOfDay);
}
