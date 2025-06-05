package com.example.demo.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Builder
public class CommentDTO {
    private int id;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO author;
    private int postId;

    // Custom constructor for convenience
    public CommentDTO(int id, String content, LocalDateTime createdAt,
                      LocalDateTime updatedAt, UserDTO author, int postId) {
        this.id = id;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.author = author;
        this.postId = postId;
    }
}
