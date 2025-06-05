package com.example.demo.Repo;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Integer> {

    // Find comments by post ID ordered by creation date
    List<Comment> findByPostIdOrderByCreatedAtAsc(int postId);

    // Find comments by user ID
    List<Comment> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Count comments by post ID
    int countByPostId(Integer postId);
}
