package com.example.demo.Controller;

import com.example.demo.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/leaderboard")
public class LeaderboardController {
     
    // === KHAI BÁO CÁC HẰNG SỐ ===
    
    //  Danh sách các phạm vi thời gian hợp lệ mà người dùng có thể chọn:
    //  
    //  - "weekly": Xem bảng xếp hạng dựa trên điểm số trong 7 ngày gần nhất
    //    Ví dụ: Ai có nhiều ngày không hút thuốc nhất trong tuần qua?
    //  
    //  - "monthly": Xem bảng xếp hạng dựa trên điểm số trong 30 ngày gần nhất  
    //    Ví dụ: Ai có thành tích tốt nhất trong tháng qua?
    //  
    //  - "all": Xem bảng xếp hạng tổng thể từ khi người dùng bắt đầu bỏ thuốc
    //    Ví dụ: Ai có tổng điểm cao nhất từ trước đến nay?
    //  
    //  Lý do sử dụng hằng số:
    //  - Tránh lỗi typo khi code
    //  - Dễ dàng thay đổi giá trị ở một nơi
    //  - Code dễ đọc và maintain hơn

    private static final String[] VALID_TIME_RANGES = {"weekly", "monthly", "all"};

    // LeaderboardService: Đây là lớp Service chứa tất cả logic nghiệp vụ
    // để tính toán điểm số, xếp hạng người dùng.

    @Autowired
    private LeaderboardService leaderboardService;

    //  API lấy dữ liệu bảng xếp hạng.
    // 
    //  timeRange Phạm vi thời gian (weekly, monthly, all)
    //  currentUserId ID của người dùng hiện tại
    //  ResponseEntity chứa dữ liệu bảng xếp hạng

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(defaultValue = "weekly") String timeRange,
            @RequestParam(required = false) Integer currentUserId) {

        try {
            // === BƯỚC 1: VALIDATION - KIỂM TRA TÍNH HỢP LỆ ===
            
    
            //  Kiểm tra xem timeRange có thuộc danh sách cho phép không.
            //  
            //  Lý do cần validation:
            //  - Tránh người dùng truyền giá trị bất kì (vd: "invalid_range")
            //  - Đảm bảo tính an toàn của ứng dụng
            //  - Trả về lỗi rõ ràng thay vì crash
            //  
            //  Nếu không hợp lệ:
            //  - Trả về HTTP 400 (Bad Request)
            //  - Kèm theo thông báo lỗi để frontend hiển thị cho user

            if (!isValidTimeRange(timeRange)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid timeRange. Must be: weekly, monthly, or all"));
            }

            // === BƯỚC 2: GỌI SERVICE - XỬ LÝ LOGIC NGHIỆP VỤ ===
            
    
            //  Gọi LeaderboardService để xử lý logic phức tạp:
            //  - Lấy danh sách tất cả người dùng từ database
            //  - Tính toán điểm số cho từng người dùng
            //  - Sắp xếp theo thứ tự điểm số
            //  - Gán thứ hạng (1, 2, 3, ...)
            //  - Tìm vị trí của người dùng hiện tại
            //  - Định dạng dữ liệu để trả về
            //  
            //  Controller KHÔNG làm những việc này - chỉ ủy thác cho Service

            Map<String, Object> leaderboardData = leaderboardService.getLeaderboardData(timeRange, currentUserId);
            // === BƯỚC 3: TRẢ VỀ KẾT QUẢ THÀNH CÔNG ===
            
    
            //  ResponseEntity.ok(): Tạo HTTP response với status 200 (OK)
            //  leaderboardData: Dữ liệu JSON chứa:
            //  {
            //    "leaderboard": [
            //      {
            //        "id": 1,
            //        "name": "Nguyễn Văn A",
            //        "totalPoints": 850,
            //        "weeklyPoints": 70,
            //        "rank": 1,
            //        "tier": "Gold",
            //        "consecutiveSmokFreeDays": 15
            //      },
            //      // ... các user khác
            //    ],
            //    "currentUser": { ... }, // Thông tin user hiện tại (nếu có)
            //    "timeRange": "weekly"
            //  }

            return ResponseEntity.ok(leaderboardData);

        } catch (Exception e) {
            System.err.println("Leaderboard error: " + e.getMessage());
            e.printStackTrace(); // In chi tiết stack trace
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch leaderboard: " + e.getMessage()));
        }
    }

    //  === HELPER METHOD - KIỂM TRA TÍNH HỢP LỆ CỦA THAM SỐ ===
    //  
    //  Phương thức này kiểm tra xem giá trị timeRange có nằm trong
    //  danh sách các giá trị được phép hay không.
    //  
    //  CÁCH HOẠT ĐỘNG:
    //  1. Arrays.asList(VALID_TIME_RANGES): Chuyển array thành List
    //     Từ: ["weekly", "monthly", "all"]
    //     Thành: List<String> có 3 phần tử
    //  
    //  2. .contains(timeRange): Kiểm tra List có chứa giá trị timeRange không
    //     - Trả về true nếu có (hợp lệ)
    //     - Trả về false nếu không có (không hợp lệ)
    //  
    //  VÍ DỤ:
    //  - isValidTimeRange("weekly") → true
    //  - isValidTimeRange("monthly") → true  
    //  - isValidTimeRange("invalid") → false
    //  - isValidTimeRange("WEEKLY") → false (case sensitive)
    //  - isValidTimeRange(null) → false
    //  
    //  LỢI ÍCH:
    //  - Tách biệt logic validation thành method riêng
    //  - Dễ test riêng biệt
    //  - Có thể tái sử dụng nếu cần
    //  - Code main method gọn gàng hơn
    //  
    //  timeRange Chuỗi cần kiểm tra
    //  true nếu hợp lệ, false nếu không hợp lệ
    
    private boolean isValidTimeRange(String timeRange) {
        return Arrays.asList(VALID_TIME_RANGES).contains(timeRange);
    }
}