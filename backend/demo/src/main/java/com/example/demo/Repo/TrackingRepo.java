package com.example.demo.Repo;

import com.example.demo.entity.Tracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

// @Repository: Đánh dấu đây là class để tương tác với database
// Interface này chứa các phương thức để truy vấn bảng "tracking"
@Repository
public interface TrackingRepo extends JpaRepository<Tracking, Integer> {

    // Tìm tất cả bản ghi tracking của một user cụ thể
    List<Tracking> findByUserId(Integer userId);

    // Tìm TOP 3 triggers (kích thích) phổ biến nhất của một user
    // Mục đích: Giúp user biết những gì thường khiến họ muốn hút thuốc
    // @Query: Viết câu lệnh SQL tùy chỉnh thay vì dùng tên method
    // nativeQuery = true: Sử dụng SQL thuần (không phải JPQL)
    @Query(value = "SELECT trigger_value " +
            "FROM tracking " +
            "WHERE user_id = :userId " +
            "AND trigger_value IS NOT NULL " +
            "AND trigger_value != '' " +
            "GROUP BY trigger_value " +
            "ORDER BY COUNT(*) DESC " +
            "LIMIT 3",
            nativeQuery = true)
    // @Param: Liên kết tham số userId trong method với :userId trong SQL
    // Ví dụ kết quả: ["Stress", "Uống cà phê", "Sau bữa ăn"]
    List<String> findTop3Triggers(@Param("userId") Integer userId);

    // Tìm tracking của user trong khoảng thời gian cụ thể
    // Mục đích: Xem lịch sử tracking theo tuần/tháng/năm
    // Ví dụ: Xem tracking từ 01/06/2025 đến 30/06/2025
    @Query(value = "SELECT * FROM tracking WHERE user_id = :userId AND date BETWEEN :startDate AND :endDate", nativeQuery = true)
    List<Tracking> findByUserIdAndDateBetween(@Param("userId") Integer userId,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate);
}