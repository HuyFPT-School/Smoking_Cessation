package com.example.demo.Repo;

import com.example.demo.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepo extends JpaRepository<PostLike, Integer> {

    // Find like by post ID and user ID
    Optional<PostLike> findByPostIdAndUserId(int postId, Integer userId);

    // Check if user has liked a post
    boolean existsByPostIdAndUserId(Integer postId, Integer userId);

}
