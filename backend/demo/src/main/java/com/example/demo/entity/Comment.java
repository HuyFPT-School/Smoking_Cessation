package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Custom constructor for convenience
    public Comment(String content, Post post, User user) {
        this.content = content;
        this.post = post;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

    // @PrePersist: Chạy tự động TRƯỚC KHI lưu lần đầu vào database
    // Backup mechanism: Đảm bảo luôn có createdAt dù quên set trong constructor
    // Safety net: Phòng trường hợp lỡ tay
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // @PreUpdate: Chạy tự động TRƯỚC KHI cập nhật database
    // Automatic timestamp: Tự động ghi nhận thời gian chỉnh sửa
    // User experience: User biết comment đã được edit
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
