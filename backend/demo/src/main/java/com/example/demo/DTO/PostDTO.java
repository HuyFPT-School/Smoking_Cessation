package com.example.demo.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {
    private int id;
    private String title;
    private String content;
    private Integer likesCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UserDTO author;
    private List<CommentDTO> comments;
    private boolean likedByCurrentUser;    // Custom constructor for convenience
    public PostDTO(int id, String title, String content, Integer likesCount,
                   Integer commentsCount, LocalDateTime createdAt, LocalDateTime updatedAt,
                   UserDTO author) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.likesCount = likesCount;
        this.commentsCount = commentsCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.author = author;
    }
}
