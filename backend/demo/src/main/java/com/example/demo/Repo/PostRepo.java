package com.example.demo.Repo;

import com.example.demo.entity.Post;
import com.example.demo.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepo extends JpaRepository<Post, Integer> {

    // Find all posts ordered by creation date (newest first)
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Find posts by user ID
    Page<Post> findByUserIdOrderByCreatedAtDesc(Integer userId, Pageable pageable);

    // Find posts by user ID (without pagination)
    List<Post> findByUserIdOrderByCreatedAtDesc(Integer userId);

    void deleteByUser(User user);

}
