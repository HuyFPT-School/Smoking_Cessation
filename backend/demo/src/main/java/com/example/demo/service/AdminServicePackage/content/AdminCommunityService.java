package com.example.demo.service.AdminServicePackage.content;

import com.example.demo.Repo.*;
import com.example.demo.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Objects;
import java.util.Optional;

// ✅ Service dùng cho ADMIN / SUPER_ADMIN để quản lý Community (xóa bài viết, bình luận,...)
@Service
@RequiredArgsConstructor  // Tự động tạo constructor với các final field
public class AdminCommunityService {

    // ===== Repository cần dùng =====
    private final PostRepo postRepo;
    private final CommentRepo commentRepo;
    private final PostLikeRepo postLikeRepo;
    private final UserRepo userRepo;

    // ==============================
    // 📌 Hàm kiểm tra quyền hạn
    // ==============================

    /**
     * ✅ Kiểm tra user có phải là ADMIN hoặc SUPER_ADMIN không
     */
    private boolean isAdminOrSuperAdmin(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.SUPER_ADMIN;
    }

    // ==============================
    // 📌 Hàm xóa bài viết bất kỳ
    // ==============================

    /**
     * ✅ Cho phép ADMIN hoặc SUPER_ADMIN xóa bài viết bất kỳ
     * 👉 URL: DELETE /api/admin/posts/delete/{postId}?adminId=...
     */
    @Transactional
    public ResponseEntity<?> deletePostByAdmin(Integer postId, Integer adminId) {

        // 🔐 Kiểm tra xem người thực hiện có phải admin không
        Optional<User> adminOpt = userRepo.findById(adminId);
        if (adminOpt.isEmpty() || !isAdminOrSuperAdmin(adminOpt.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied: You are not an admin"));
        }

        // 🔎 Tìm bài viết theo ID
        Optional<Post> postOpt = postRepo.findById(postId);
        if (postOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Post not found"));
        }

        Post post = postOpt.get();

        // ✅ Xóa dữ liệu liên quan trước để tránh lỗi khóa ngoại:
        postLikeRepo.deleteByPostId(postId);     // Xóa like
        commentRepo.deleteByPostId(postId);      // Xóa comment
        postRepo.delete(post);                   // Cuối cùng xóa post

        return ResponseEntity.ok(Map.of("message", "Post deleted by admin successfully"));
    }

    // ==============================
    // 📌 Hàm xóa bình luận bất kỳ
    // ==============================

    /**
     * ✅ Cho phép ADMIN hoặc SUPER_ADMIN xóa bình luận bất kỳ
     * 👉 URL: DELETE /api/admin/comments/delete/{commentId}?adminId=...
     */
    @Transactional
    public ResponseEntity<?> deleteCommentByAdmin(Integer commentId, Integer adminId) {

        // 🔐 Kiểm tra quyền
        Optional<User> adminOpt = userRepo.findById(adminId);
        if (adminOpt.isEmpty() || !isAdminOrSuperAdmin(adminOpt.get())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Access denied: You are not an admin"));
        }

        // 🔎 Tìm comment
        Optional<Comment> commentOpt = commentRepo.findById(commentId);
        if (commentOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Comment not found"));
        }

        Comment comment = commentOpt.get();
        Post post = comment.getPost();  // Lấy bài viết gốc để cập nhật số lượng comment

        commentRepo.delete(comment);    // ✅ Xóa bình luận

        // ✅ Cập nhật lại số lượng comment cho bài viết (giảm đi 1, nhưng không < 0)
        post.setCommentsCount(Math.max(0, post.getCommentsCount() - 1));
        postRepo.save(post);  // Lưu thay đổi

        return ResponseEntity.ok(Map.of("message", "Comment deleted by admin successfully"));
    }
}

