package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_likes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "user_id"})
})
// Đảm bảo một user chỉ có thể like một post một lần duy nhất
// Ngăn chặn việc spam like
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY) // Nhiều like thuộc về một post
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Custom constructor for convenience
    public PostLike(Post post, User user) {
        this.post = post;
        this.user = user;
        this.createdAt = LocalDateTime.now();
    }

 // @PrePersist: Chạy tự động TRƯỚC KHI lưu vào database
 // Backup mechanism: Đảm bảo luôn có createdAt dù quên set
 // Automatic timestamp: Tự động ghi nhận thời gian
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
