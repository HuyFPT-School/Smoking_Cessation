package com.example.demo.Controller;

import com.example.demo.DTO.DashboardDTO;
import com.example.demo.service.UserDashboardService.DashboardService;
import com.example.demo.utils.DataUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {


    private final DashboardService dashboardService;

    // ========================================
    //  API: LẤY DỮ LIỆU DASHBOARD CHÍNH
    // ========================================

    /**
     *  Trả về dữ liệu dashboard hiện tại của một user
     *  Dùng để hiển thị thông tin như: ngày không hút, số điếu tránh được, milestone tiếp theo...
     */
    @GetMapping("/{userId}")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Integer userId) {
        return dashboardService.getDashboard(userId);
    }

    // ========================================
    //  API: LỊCH SỬ TRACKING
    // ========================================

    /**
     *  Trả về danh sách lịch sử tracking (theo ngày) của user
     *  Dùng cho biểu đồ, thống kê theo ngày trên giao diện dashboard
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTrackingHistory(@PathVariable Integer userId) {
        return dashboardService.getTrackingHistory(userId);
    }

    // ========================================
    //  XỬ LÝ SỰ KIỆN REALTIME TỪ WEBSOCKET HOẶC HÀNH VI KHÁC
    // ========================================

    /**
     *  Lắng nghe sự kiện DataUpdatedEvent (phát ra khi có dữ liệu mới như tracking hoặc kế hoạch)
     *  Khi sự kiện được gửi (ví dụ qua WebSocket hoặc Service khác), hàm này sẽ chạy bất đồng bộ
     */
    @EventListener
    @Async
    @Transactional
    public void handleDataUpdatedEvent(DataUpdatedEvent event) {
        dashboardService.handleDataUpdatedEvent(event.getUserId());  // Cập nhật dữ liệu dashboard cho user tương ứng
    }
}
