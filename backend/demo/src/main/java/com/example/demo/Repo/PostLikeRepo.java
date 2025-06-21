package com.example.demo.Repo;

import com.example.demo.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeRepo extends JpaRepository<PostLike, Integer> {
    // Tìm bản ghi like cụ thể bằng post ID và user ID
    // Mục đích: Kiểm tra xem user đã like post này chưa và lấy thông tin chi tiết
    // Ví dụ: findByPostIdAndUserId(1, 123) → tìm like của user 123 cho post 1
    // Trả về: Optional<PostLike> - có thể có hoặc không có (nếu chưa like)
    Optional<PostLike> findByPostIdAndUserId(Integer postId, Integer userId);

    // Kiểm tra xem user đã like post này chưa (chỉ trả về true/false)
    // Mục đích: Hiển thị trạng thái nút like (đã like hay chưa)
    // Ví dụ: existsByPostIdAndUserId(1, 123) → true nếu user 123 đã like post 1
    // Hiệu quả hơn findByPostIdAndUserId khi chỉ cần biết có/không
    boolean existsByPostIdAndUserId(Integer postId, Integer userId);

    // Xóa tất cả likes của một post cụ thể
    // @Modifying: Báo cho Spring biết đây là operation thay đổi dữ liệu (DELETE)
    // Mục đích: Cleanup khi xóa bài viết - xóa tất cả likes liên quan
    // Ví dụ: deleteByPostId(1) → xóa tất cả likes của post có ID = 1
    // Quan trọng: Phải gọi trong @Transactional để đảm bảo consistency
    @Modifying
    void deleteByPostId(Integer postId);

}
