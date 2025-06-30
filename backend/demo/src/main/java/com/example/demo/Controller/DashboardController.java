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

// ✅ Controller REST cho các API liên quan đến Dashboard người dùng (theo dõi bỏ thuốc)
@RestController  // Đánh dấu class này là REST Controller → các @RequestMapping sẽ trả JSON
@RequestMapping("/api/dashboard")  // Tất cả API trong controller này sẽ có tiền tố /api/dashboard
@RequiredArgsConstructor  // Tự động tạo constructor cho các trường final (dùng để Spring inject service)
public class DashboardController {

    // ✅ Inject DashboardService thông qua constructor (nhờ @RequiredArgsConstructor)
    private final DashboardService dashboardService;

    // ========================================
    // 📌 API: LẤY DỮ LIỆU DASHBOARD CHÍNH
    // ========================================

    /**
     * ✅ Trả về dữ liệu dashboard hiện tại của một user
     * 📌 Dùng để hiển thị thông tin như: ngày không hút, số điếu tránh được, milestone tiếp theo...
     * 🔗 URL: GET /api/dashboard/{userId}
     * 🧩 Trả về kiểu: DashboardDTO (chứa dữ liệu tổng hợp)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Integer userId) {
        return dashboardService.getDashboard(userId);
    }

    // ========================================
    // 📌 API: LỊCH SỬ TRACKING
    // ========================================

    /**
     * ✅ Trả về danh sách lịch sử tracking (theo ngày) của user
     * 📌 Dùng cho biểu đồ, thống kê theo ngày trên giao diện dashboard
     * 🔗 URL: GET /api/dashboard/history/{userId}
     * 📤 Trả về List< Map<String, Object> > gồm các key: date, cigarettes, cravings, resistanceRate...
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTrackingHistory(@PathVariable Integer userId) {
        return dashboardService.getTrackingHistory(userId);
    }

    // ========================================
    // 📌 XỬ LÝ SỰ KIỆN REALTIME TỪ WEBSOCKET HOẶC HÀNH VI KHÁC
    // ========================================

    /**
     * ✅ Lắng nghe sự kiện DataUpdatedEvent (phát ra khi có dữ liệu mới như tracking hoặc kế hoạch)
     * 📌 Khi sự kiện được gửi (ví dụ qua WebSocket hoặc Service khác), hàm này sẽ chạy bất đồng bộ
     * 🧵 @Async: Chạy không chặn luồng chính
     * 🔄 @Transactional: Đảm bảo thao tác trong 1 giao dịch
     */
    @EventListener
    @Async
    @Transactional
    public void handleDataUpdatedEvent(DataUpdatedEvent event) {
        dashboardService.handleDataUpdatedEvent(event.getUserId());  // Cập nhật dữ liệu dashboard cho user tương ứng
    }
}
