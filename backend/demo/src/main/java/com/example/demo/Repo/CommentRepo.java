package com.example.demo.Repo;

import com.example.demo.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comment, Integer> {
    // Tìm tất cả comments của một post cụ thể, sắp xếp theo thời gian tạo (cũ nhất trước)
    List<Comment> findByPostIdOrderByCreatedAtAsc(Integer postId);

    // Tìm tất cả comments của một user cụ thể, sắp xếp theo thời gian tạo (mới nhất trước)
    List<Comment> findByUserIdOrderByCreatedAtDesc(Integer userId);

    // Xóa tất cả comments của một post cụ thể
    // @Modifying: Báo cho Spring biết đây là operation thay đổi dữ liệu (DELETE)
    @Modifying
    void deleteByPostId(Integer postId);

}
