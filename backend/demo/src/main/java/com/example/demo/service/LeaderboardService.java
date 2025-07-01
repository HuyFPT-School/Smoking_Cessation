package com.example.demo.service;

import com.example.demo.DTO.LeaderboardUserDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.entity.Role;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util;
import java.util.stream.Collectors;


@Service // Đây là nhãn cho Spring Boot biết đây là một "dịch vụ" - như một nhân viên chuyên làm việc gì đó
public class LeaderboardService {

    // === CÁC HẰNG SỐ ĐIỂM SỐ ===
    //  Hệ thống điểm số được thiết kế để khuyến khích hành vi tích cực:
    //  
    //  ĐIỂM THƯỞNG (Khuyến khích):
    //  - DAILY_SMOKE_FREE_POINTS: +8 điểm cho mỗi ngày không hút thuốc
    //  - STREAK_BONUS_POINTS: +2 điểm thưởng cho mỗi ngày trong chuỗi liên tiếp
    //  - WEEKLY_STREAK_BONUS: +40 điểm thưởng khi hoàn thành 7 ngày liên tiếp
    //  - MONTHLY_STREAK_BONUS: +150 điểm thưởng khi hoàn thành 30 ngày liên tiếp
    //  - CRAVING_RECORD_POINTS: +4 điểm khi ghi lại cảm giác thèm thuốc
    //  
    //  ĐIỂM PHẠT (Ngăn cản):
    //  - SMOKING_PENALTY: -15 điểm khi ghi nhận hút thuốc
    //  
    //  ĐIỂM CHO CÁC PHẠM VI THỜI GIAN:
    //  - WEEKLY_DAILY_POINTS: +10 điểm/ngày cho bảng xếp hạng tuần
    //  - MONTHLY_DAILY_POINTS: +10 điểm/ngày cho bảng xếp hạng tháng

    private static final int DAILY_SMOKE_FREE_POINTS = 8;    // Điểm cơ bản hàng ngày
    private static final int STREAK_BONUS_POINTS = 2;        // Thưởng chuỗi ngày liên tiếp
    private static final int WEEKLY_STREAK_BONUS = 40;       // Thưởng chuỗi 7 ngày
    private static final int MONTHLY_STREAK_BONUS = 150;     // Thưởng chuỗi 30 ngày
    private static final int CRAVING_RECORD_POINTS = 4;      // Thưởng ghi lại cảm giác thèm
    private static final int SMOKING_PENALTY = 15;           // Phạt khi hút thuốc
    private static final int WEEKLY_DAILY_POINTS = 10;       // Điểm ngày cho bảng tuần
    private static final int MONTHLY_DAILY_POINTS = 10;      // Điểm ngày cho bảng tháng

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private TrackingRepo trackingRepo;

    //  === PHƯƠNG THỨC CHÍNH - LẤY DỮ LIỆU BẢNG XẾP HẠNG ===
    //  
    //  Đây là "method chủ chốt" mà Controller sẽ gọi.
    //  Orchestrates (điều phối) toàn bộ quá trình tạo bảng xếp hạng.
    //  
    //  FLOW HOẠT ĐỘNG (như một dây chuyền sản xuất):
    //  1. Lấy danh sách tất cả người dùng từ database
    //  2. Tính toán điểm số cho từng người dùng
    //  3. Sắp xếp theo điểm số (cao → thấp)
    //  4. Gán thứ hạng (1, 2, 3, ...)
    //  5. Tìm vị trí của người dùng hiện tại
    //  6. Đóng gói kết quả để trả về Controller
    //  
    //  INPUT:
    //  timeRange: "weekly" | "monthly" | "all" - phạm vi thời gian xem điểm
    //  currentUserId: ID của user đang đăng nhập (để highlight trong UI)
    //  
    //  OUTPUT:
    //  Map chứa:
    //  {
    //    "leaderboard": [...],    // Danh sách user đã sắp xếp
    //    "currentUser": {...},    // Thông tin user hiện tại
    //    "timeRange": "weekly"    // Phạm vi thời gian được request
    //  }
    public Map<String, Object> getLeaderboardData(String timeRange, Integer currentUserId) {
        // Bước 1: Lấy tất cả users có role = USER (bỏ qua ADMIN)
        List<User> users = userRepo.findByRole(Role.USER);

        // Bước 2: Tính toán điểm số cho tất cả users
        List<LeaderboardUserDTO> leaderboardUsers = calculateAllUserStats(users, timeRange);
        
        // Bước 3: Sắp xếp theo điểm số (cao xuống thấp)
        sortUsersByTimeRange(leaderboardUsers, timeRange);

        // Bước 4: Gán thứ hạng (1, 2, 3, ...)
        assignRanks(leaderboardUsers);
        
        // Bước 5: Tìm user hiện tại trong danh sách
        LeaderboardUserDTO currentUser = findCurrentUser(leaderboardUsers, currentUserId);
        
        // Bước 6: Tạo response object hoàn chỉnh
        return createLeaderboardResponse(leaderboardUsers, currentUser, timeRange);
    }

    //  === TÍNH TOÁN THỐNG KÊ CHO TẤT CẢ NGƯỜI DÙNG ===
    //  
    //  Method này lặp qua tất cả users và tính điểm cho từng người.
    //  Giống như một "máy tính điểm tự động" xử lý từng hồ sơ một.
    //  
    //  CÁCH XỬ LÝ LỖI:
    //  - Nếu tính điểm cho user nào bị lỗi → skip user đó, tiếp tục user khác
    //  - Đảm bảo 1 user lỗi không làm crash toàn bộ bảng xếp hạng
    //  - Log lỗi để developer có thể debug sau
    //  
    //  VÍ DỤ:
    //  - Input: [User1, User2, User3]
    //  - User2 có lỗi dữ liệu → skip
    //  - Output: [UserStats1, UserStats3]
    //  
    //  users Danh sách tất cả users từ database
    //  timeRange Phạm vi thời gian để tính điểm phù hợp
    //  Danh sách UserDTO đã tính xong điểm số
    private List<LeaderboardUserDTO> calculateAllUserStats(List<User> users, String timeRange) {
        List<LeaderboardUserDTO> leaderboardUsers = new ArrayList<>();
        
        for (User user : users) {
            try {
                // Gọi method tính điểm cho từng user cụ thể
                LeaderboardUserDTO userStats = calculateUserStats(user, timeRange);
                if (userStats != null) {
                    leaderboardUsers.add(userStats);
                }
            } catch (Exception e) {
                // Bắt lỗi và log, nhưng không crash toàn bộ process
                System.err.println("Error calculating stats for user " + user.getId() + ": " + e.getMessage());
            }
        }
        
        return leaderboardUsers;
    }

    //  === TÍNH TOÁN THỐNG KÊ CHO MỘT NGƯỜI DÙNG CỤ THỂ ===
    //  
    //  Đây là "bộ máy tính toán cốt lõi" cho mỗi user.
    //  Như một bảng tính Excel phức tạp để tính điểm từ nhiều nguồn dữ liệu.
    //  
    //  QUY TRÌNH 6 BƯỚC:
    //  1. Tạo object cơ bản với thông tin user (id, name, avatar)
    //  2. Xác định ngày bắt đầu bỏ thuốc (từ Plan hoặc ngày đăng ký)
    //  3. Tính tổng số ngày đã trôi qua kể từ khi bắt đầu
    //  4. Lấy dữ liệu tracking (lịch sử hút thuốc, cảm giác thèm)
    //  5. Tính chuỗi ngày không hút thuốc liên tiếp hiện tại
    //  6. Điền đầy đủ tất cả thông tin vào object kết quả
    //  
    //  DỮ LIỆU ĐẦU RA:
    //  - Điểm số (total/weekly/monthly)
    //  - Số ngày không hút thuốc liên tiếp
    //  - Hạng (tier): Bronze, Silver, Gold, Platinum, Diamond, Legend
    //  - Ngày bắt đầu bỏ thuốc
    //  - Tổng số ngày kể từ khi bắt đầu
    //  
    //  user Object User từ database
    //  timeRange Phạm vi thời gian để tính tier phù hợp
    //  LeaderboardUserDTO chứa đầy đủ thông tin đã tính toán
    private LeaderboardUserDTO calculateUserStats(User user, String timeRange) {
        try {
            // Bước 1: Tạo object cơ bản
            LeaderboardUserDTO userStats = createBasicUserStats(user);
            
            // Bước 2: Xác định ngày bắt đầu bỏ thuốc
            LocalDate startDate = determineStartDate(user);
            String startDateString = startDate.toString();
            
            // Bước 3: Tính tổng số ngày
            int totalDaysSinceQuit = calculateTotalDaysSinceQuit(startDate);

            // Bước 4: Lấy dữ liệu tracking hợp lệ
            List<Tracking> allTrackingEntries = getValidTrackingEntries(user, startDate);
            
            // Bước 5: Tính chuỗi ngày liên tiếp
            int consecutiveSmokFreeDays = calculateCurrentStreakDays(allTrackingEntries, startDate);
            
            // Bước 6: Điền đầy đủ thông tin vào object
            populateUserStats(userStats, allTrackingEntries, consecutiveSmokFreeDays, 
                            startDate, startDateString, totalDaysSinceQuit, timeRange);
            
            return userStats;
        } catch (Exception e) {
            System.err.println("Error calculating user stats for user " + user.getId() + ": " + e.getMessage());
            return null;
        }
    }

    //  === TẠO THÔNG TIN CƠ BẢN CHO NGƯỜI DÙNG ===
    //  
    //  Method đơn giản để khởi tạo object LeaderboardUserDTO với thông tin cơ bản.
    //  Giống như điền thông tin căn cước công dân vào form.
    //  
    //  THÔNG TIN CƠ BẢN:
    //  - ID: Định danh duy nhất của user
    //  - Name: Tên hiển thị của user
    //  - AvatarUrl: Link đến ảnh đại diện
    //  
    //  user Object User từ database
    //  LeaderboardUserDTO với thông tin cơ bản đã điền
    private LeaderboardUserDTO createBasicUserStats(User user) {
        LeaderboardUserDTO userStats = new LeaderboardUserDTO();
        userStats.setId(user.getId());
        userStats.setName(user.getName());
        userStats.setAvatarUrl(user.getAvatarUrl());
        return userStats;
    }

    //  === XÁC ĐỊNH NGÀY BẮT ĐẦU BỎ THUỐC ===
    //  
    //  Method này tìm ra ngày user bắt đầu hành trình bỏ thuốc.
    //  Có 3 mức ưu tiên như một "thang quyết định":
    //  
    //  MỨC ƯU TIÊN:
    //  1. QUYẾT ĐỊNH CHÍNH THỨC: Ngày trong Plan.quitDate
    //     - User đã tạo plan cụ thể và set ngày bắt đầu
    //     - Đây là ngày chính thức nhất
    //  
    //  2. FALLBACK: Ngày đăng ký User.createAt
    //     - Nếu không có plan, coi như bắt đầu từ ngày đăng ký app
    //     - Giả định user có ý định bỏ thuốc khi tải app
    //  
    //  3. DEFAULT: Ngày hiện tại
    //     - Trường hợp khẩn cấp nếu không có dữ liệu gì
    //     - Tránh crash, cho phép app hoạt động
    //  
    //  XỬ LÝ LỖI:
    //  - Mọi exception đều được catch và fallback về ngày hiện tại
    //  - Log lỗi để developer biết có vấn đề data
    //  
    //  user Object User cần xác định ngày bắt đầu
    //  LocalDate của ngày bắt đầu bỏ thuốc
    private LocalDate determineStartDate(User user) {
        try {
            // Mức ưu tiên 1: Tìm Plan và lấy quitDate
            Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(user.getId()));
            if (planOpt.isPresent() && planOpt.get().getQuitDate() != null) {
                return planOpt.get().getQuitDate();
            }
            
            // Mức ưu tiên 2: Dùng ngày đăng ký
            if (user.getCreateAt() != null) {
                return user.getCreateAt().toLocalDate();
            }
        } catch (Exception e) {
            System.err.println("Error determining start date for user " + user.getId() + ": " + e.getMessage());
        }
        
        // Mức ưu tiên 3: Default về ngày hiện tại
        return LocalDate.now();
    }

    //  === TÍNH TỔNG SỐ NGÀY KỂ TỪ KHI BẮT ĐẦU BỎ THUỐC ===
    //  
    //  Method đơn giản để tính số ngày đã trôi qua.
    //  Như dùng lịch để đếm số ngày từ ngày A đến ngày B.
    //  
    //  LOGIC:
    //  - ChronoUnit.DAYS.between(): Hàm Java để tính khoảng cách ngày
    //  - Math.max(..., 0): Đảm bảo không trả về số âm
    //    (trường hợp startDate trong tương lai)
    //  
    //  VÍ DỤ:
    //  - startDate: 2025-01-01
    //  - Ngày hiện tại: 2025-01-15
    //  - Kết quả: 14 ngày
    //  
    //  startDate Ngày bắt đầu bỏ thuốc
    //  return Số ngày đã trôi qua (>= 0)
    private int calculateTotalDaysSinceQuit(LocalDate startDate) {
        int totalDays = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
        return Math.max(totalDays, 0);
    }

    //  === LẤY DANH SÁCH TRACKING ENTRIES HỢP LỆ ===
    //  
    //  Method này lọc và lấy dữ liệu tracking có chất lượng từ database.
    //  Như một "bộ lọc chất lượng" để loại bỏ dữ liệu rác.
    //  
    //  QUY TRÌNH:
    //  1. Lấy TẤT CẢ tracking của user từ database
    //  2. Áp dụng filter để chỉ giữ lại records hợp lệ
    //  3. Convert Java Stream thành List để xử lý tiếp
    //  
    //  ĐIỀU KIỆN HỢP LỆ (trong isValidTracking):
    //  - Tracking object không null
    //  - Có ngày tháng hợp lệ
    //  - Ngày trong tracking >= ngày bắt đầu bỏ thuốc
    //  
    //  XỬ LÝ LỖI:
    //  - Nếu database có vấn đề → trả về list rỗng
    //  - Log lỗi để developer biết
    //  - App vẫn hoạt động được (graceful degradation)
    //  
    //  user User cần lấy tracking data
    //  startDate Ngày bắt đầu để filter
    //  return List tracking entries hợp lệ
    private List<Tracking> getValidTrackingEntries(User user, LocalDate startDate) {
        try {
            return trackingRepo.findByUserId(user.getId())
                    .stream()
                    .filter(tracking -> isValidTracking(tracking, startDate))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching tracking entries for user " + user.getId() + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    //  === KIỂM TRA TRACKING ENTRY CÓ HỢP LỆ KHÔNG ===
    //  
    //  Method validation để đảm bảo chất lượng dữ liệu.
    //  Như một "cửa kiểm soát chất lượng" tại nhà máy.
    //  
    //  CÁC KIỂM TRA:
    //  1. NULL CHECK: Tracking object không null
    //  2. DATE CHECK: Có ngày tháng và không rỗng
    //  3. DATE FORMAT: Ngày đúng format ISO (yyyy-MM-dd)
    //  4. DATE LOGIC: Ngày >= ngày bắt đầu bỏ thuốc
    //  
    //  LÝ DO CẦN VALIDATION:
    //  - Database có thể chứa dữ liệu không đầy đủ
    //  - User có thể nhập sai format ngày
    //  - Tránh crash khi parse ngày
    //  - Chỉ tính điểm cho dữ liệu có ý nghĩa
    //  
    //  tracking Object Tracking cần kiểm tra
    //  startDate Ngày bắt đầu để so sánh
    //  return true nếu hợp lệ, false nếu không
    private boolean isValidTracking(Tracking tracking, LocalDate startDate) {
        // Kiểm tra object và date string
        if (tracking == null || tracking.getDate() == null || tracking.getDate().trim().isEmpty()) {
            return false;
        }
        
        try {
            // Parse và kiểm tra logic ngày tháng
            LocalDate trackingDate = LocalDate.parse(tracking.getDate().trim());
            // isAfter(startDate.minusDays(1)): Bao gồm cả ngày startDate
            return trackingDate.isAfter(startDate.minusDays(1));
        } catch (Exception e) {
            System.err.println("Invalid date format for tracking: " + tracking.getDate());
            return false;
        }
    }

    //  === ĐIỀN ĐẦY ĐỦ THÔNG TIN THỐNG KÊ CHO NGƯỜI DÙNG ===
    //  
    //  Method này là "trạm hoàn thiện cuối cùng" - tính toán và điền
    //  TẤT CẢ thông tin còn lại vào object LeaderboardUserDTO.
    //  
    //  CÁC THÔNG TIN ĐƯỢC TÍNH TOÁN:
    //  1. Điểm số:
    //     - totalPoints: Tổng điểm từ trước đến nay
    //     - weeklyPoints: Điểm trong 7 ngày gần nhất
    //     - monthlyPoints: Điểm trong 30 ngày gần nhất
    //  
    //  2. Thông tin ngày tháng:
    //     - startDate: Ngày bắt đầu bỏ thuốc (string format)
    //     - totalDaysSinceQuit: Tổng số ngày đã trôi qua
    //     - consecutiveSmokFreeDays: Chuỗi ngày không hút thuốc liên tiếp
    //  
    //  3. Hạng (Tier):
    //     - Dựa trên timeRange để chọn loại điểm phù hợp
    //     - weekly → dùng weeklyPoints để tính tier
    //     - monthly → dùng monthlyPoints để tính tier  
    //     - all → dùng totalPoints để tính tier
    //  
    //   userStats Object để điền thông tin vào
    //   trackingEntries Dữ liệu tracking để tính điểm
    //   consecutiveSmokFreeDays Chuỗi ngày liên tiếp đã tính
    //   startDate Ngày bắt đầu
    //   startDateString Ngày bắt đầu dạng string
    //   totalDaysSinceQuit Tổng số ngày
    //   timeRange Phạm vi thời gian để tính tier
    private void populateUserStats(LeaderboardUserDTO userStats, List<Tracking> trackingEntries,
                                 int consecutiveSmokFreeDays, LocalDate startDate, String startDateString,
                                 int totalDaysSinceQuit, String timeRange) {
        
        // Tính các loại điểm số
        int totalPoints = calculateTotalPoints(trackingEntries, consecutiveSmokFreeDays, startDate);
        int weeklyPoints = calculateWeeklyPoints(trackingEntries, startDate);
        int monthlyPoints = calculateMonthlyPoints(trackingEntries, startDate);
        
        // Điền thông tin vào object
        userStats.setTotalPoints(totalPoints);
        userStats.setWeeklyPoints(weeklyPoints);
        userStats.setMonthlyPoints(monthlyPoints);
        userStats.setStartDate(startDateString);
        userStats.setTotalDaysSinceQuit(totalDaysSinceQuit);
        userStats.setConsecutiveSmokFreeDays(consecutiveSmokFreeDays);
        userStats.setTier(calculateTierByTimeRange(timeRange, totalPoints, weeklyPoints, monthlyPoints));
    }

    //  === TÍNH SỐ NGÀY KHÔNG HÚT THUỐC LIÊN TIẾP HIỆN TẠI ===
    //  
    //  Đây là một trong những tính toán QUAN TRỌNG NHẤT của hệ thống.
    //  Tính "streak" - chuỗi ngày liên tiếp không hút thuốc tính đến hiện tại.
    //  
    //  CÁCH HOẠT ĐỘNG:
    //  1. Tìm ngày hút thuốc GẦN NHẤT trong lịch sử
    //  2. Nếu có ngày hút thuốc gần nhất:
    //     → Chuỗi bắt đầu từ ngày TIẾP THEO sau ngày hút thuốc đó
    //  3. Nếu KHÔNG có ngày hút thuốc nào:
    //     → Chuỗi bắt đầu từ ngày bắt đầu bỏ thuốc
    //  4. Tính số ngày từ điểm bắt đầu chuỗi đến HÔM NAY
    //  
    //  TRƯỜNG HỢP ĐặC BIỆT:
    //  - Nếu hút thuốc HÔM NAY → streak = 0 (chuỗi bị phá vỡ)
    //  - Streak không được vượt quá tổng số ngày bỏ thuốc
    //  - Streak không được âm
    //  
    //  VÍ DỤ MINH HỌA:
    //  - Ngày bắt đầu bỏ thuốc: 01/01/2025
    //  - Ngày hút thuốc gần nhất: 10/01/2025  
    //  - Ngày hiện tại: 20/01/2025
    //  → Streak = 9 ngày (từ 11/01 đến 20/01)
    //  
    //  trackingEntries Lịch sử tracking của user
    //  startDate Ngày bắt đầu bỏ thuốc  
    //  return Số ngày streak hiện tại
    private int calculateCurrentStreakDays(List<Tracking> trackingEntries, LocalDate startDate) {
        try {
            // Bước 1: Tìm ngày hút thuốc gần nhất
            Optional<LocalDate> lastSmokingDate = findLastSmokingDate(trackingEntries);
            // Bước 2: Xác định điểm bắt đầu của chuỗi hiện tại
            LocalDate streakStartDate = determineStreakStartDate(lastSmokingDate, startDate);
            // Bước 3: Kiểm tra trường hợp đặc biệt - hút thuốc hôm nay
            if (isSmokingToday(lastSmokingDate)) {
                return 0; // Chuỗi bị phá vỡ
            }
            
            // Bước 4: Tính số ngày trong chuỗi
            int streakDays = (int) ChronoUnit.DAYS.between(streakStartDate, LocalDate.now());
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
            
            // Bước 5: Áp dụng các ràng buộc logic
            return Math.max(Math.min(streakDays, totalDaysSinceQuit), 0);
        } catch (Exception e) {
            System.err.println("Error calculating streak days: " + e.getMessage());
            return 0;
        }
    }

    //  === TÌM NGÀY HÚT THUỐC GẦN NHẤT ===
    //  
    //  Method này tìm ngày hút thuốc cuối cùng trong lịch sử tracking.
    //  Sử dụng Java Stream để xử lý data một cách functional.
    //  
    //  QUY TRÌNH STREAM:
    //  1. .filter(): Chỉ lấy tracking có type = "smoking"
    //  2. .map(): Chuyển đổi Tracking object thành LocalDate  
    //  3. .filter(): Loại bỏ các date null (parse thất bại)
    //  4. .max(): Tìm ngày lớn nhất (gần đây nhất)
    //  
    //  KẾT QUẢ:
    //  - Optional<LocalDate>: Có thể có hoặc không có kết quả
    //  - Nếu user chưa bao giờ hút thuốc → Optional.empty()
    //  - Nếu có → Optional chứa ngày hút thuốc gần nhất
    //  
    //  trackingEntries Danh sách tracking để tìm kiếm
    //  return Optional chứa ngày hút thuốc gần nhất (nếu có)
    private Optional<LocalDate> findLastSmokingDate(List<Tracking> trackingEntries) {
        return trackingEntries.stream()
                .filter(tracking -> tracking != null && "smoking".equals(tracking.getType()))
                .map(this::parseTrackingDate) // Gọi method parseTrackingDate
                .filter(Objects::nonNull) // Loại bỏ null values
                .max(LocalDate::compareTo); // Tìm ngày lớn nhất
    }

    //  === CHUYỂN ĐỔI CHUỖI NGÀY THÀNH LOCALDATE ===
    //  
    //  Helper method để parse string date thành LocalDate object.
    //  Có xử lý exception để tránh crash khi gặp format sai.
    //  
    //  XỬ LÝ:
    //  - LocalDate.parse(): Parse ISO date format (yyyy-MM-dd)
    //  - .trim(): Loại bỏ khoảng trắng thừa
    //  - Try-catch: Bắt lỗi parse và log
    //  - Return null: Nếu parse thất bại
    //  
    //  VÍ DỤ:
    //  - Input: "2025-01-15" → Output: LocalDate(2025, 1, 15)
    //  - Input: "invalid-date" → Output: null (và log lỗi)
    //  - Input: null → Output: null
    //  
    //  tracking Object Tracking chứa date string
    //  return LocalDate object hoặc null nếu parse thất bại
    private LocalDate parseTrackingDate(Tracking tracking) {
        try {
            return tracking.getDate() != null ? LocalDate.parse(tracking.getDate().trim()) : null;
        } catch (Exception e) {
            System.err.println("Invalid date format in tracking: " + tracking.getDate());
            return null;
        }
    }

    //  === XÁC ĐỊNH NGÀY BẮT ĐẦU CHUỖI KHÔNG HÚT THUỐC ===
    //  
    //  Method logic để xác định từ ngày nào bắt đầu đếm chuỗi streak hiện tại.
    //  
    //  LOGIC QUY ẾT ĐỊNH:
    //  - Nếu CÓ ngày hút thuốc gần nhất:
    //    → Chuỗi bắt đầu từ ngày TIẾP THEO (.plusDays(1))
    //  - Nếu KHÔNG CÓ ngày hút thuốc nào:
    //    → Chuỗi bắt đầu từ ngày bắt đầu bỏ thuốc
    //  
    //  VÍ DỤ:
    //  - lastSmokingDate = 2025-01-10 → streakStart = 2025-01-11
    //  - lastSmokingDate = null → streakStart = startDate
    //  
    //   lastSmokingDate Optional chứa ngày hút thuốc gần nhất
    //   startDate Ngày bắt đầu bỏ thuốc làm fallback
    //   return Ngày bắt đầu chuỗi streak hiện tại
    private LocalDate determineStreakStartDate(Optional<LocalDate> lastSmokingDate, LocalDate startDate) {
        return lastSmokingDate.map(date -> date.plusDays(1)).orElse(startDate);
    }

    //  === KIỂM TRA CÓ HÚT THUỐC HÔM NAY KHÔNG ===
    //  
    //  Method kiểm tra trường hợp đặc biệt: user có hút thuốc hôm nay không.
    //  Nếu có → streak = 0 (chuỗi bị phá vỡ).
    //  
    //  LOGIC:
    //  - Kiểm tra Optional có giá trị không
    //  - So sánh ngày hút thuốc gần nhất với ngày hiện tại
    //  - LocalDate.now().equals(): So sánh chính xác ngày
    //  
    //  lastSmokingDate Optional chứa ngày hút thuốc gần nhất
    //  return true nếu hút thuốc hôm nay, false nếu không
    private boolean isSmokingToday(Optional<LocalDate> lastSmokingDate) {
        return lastSmokingDate.isPresent() && lastSmokingDate.get().equals(LocalDate.now());
    }

    //  === TÍNH TỔNG ĐIỂM CỦA NGƯỜI DÙNG ===
    //  
    //  Đây là method PHỨC TẠP NHẤT - tính tổng điểm của user dựa trên
    //  toàn bộ hành trình bỏ thuốc từ ngày bắt đầu đến hiện tại.
    //  
    //  HỆ THỐNG ĐIỂM 6 THÀNH PHẦN:
    //  
    //  1. ĐIỂM CƠ BẢN NGÀY KHÔNG HÚT THUỐC:
    //     - Tính số ngày thực tế không hút thuốc
    //     - = Tổng số ngày - Số ngày có hút thuốc
    //     - × DAILY_SMOKE_FREE_POINTS (8 điểm/ngày)
    //  
    //  2. ĐIỂM THƯỞNG CHUỖI LIÊN TIẾP:
    //     - Mỗi ngày trong chuỗi hiện tại × STREAK_BONUS_POINTS (2 điểm)
    //     - Khuyến khích duy trì chuỗi dài
    //  
    //  3. ĐIỂM THƯỞNG CHUỖI TUẦN:
    //     - Mỗi chuỗi 7 ngày hoàn chỉnh × WEEKLY_STREAK_BONUS (40 điểm)
    //     - Milestone quan trọng đầu tiên
    //  
    //  4. ĐIỂM THƯỞNG CHUỖI THÁNG:
    //     - Mỗi chuỗi 30 ngày hoàn chỉnh × MONTHLY_STREAK_BONUS (150 điểm)
    //     - Milestone lớn, thưởng cao
    //  
    //  5. ĐIỂM THƯỞNG GHI LẠI CẢM GIÁC THÈM:
    //     - Mỗi lần ghi lại × CRAVING_RECORD_POINTS (4 điểm)
    //     - Khuyến khích self-awareness
    //  
    //  6. ĐIỂM PHẠT HÚT THUỐC:
    //     - Mỗi lần hút thuốc × SMOKING_PENALTY (15 điểm phạt)
    //     - Tạo động lực tránh hút thuốc
    //  
    //   trackingEntries Lịch sử tracking để tính điểm
    //   consecutiveSmokFreeDays Chuỗi ngày liên tiếp đã tính
    //   startDate Ngày bắt đầu để tính tổng số ngày
    //  return Tổng điểm của user
    private int calculateTotalPoints(List<Tracking> trackingEntries, int consecutiveSmokFreeDays, LocalDate startDate) {
        int points = 0;
        
        // Tính dữ liệu cơ bản
        int totalDaysSinceStart = calculateTotalDaysSinceQuit(startDate);
        Set<LocalDate> smokingDates = getSmokingDates(trackingEntries);
        
        int actualSmokFreeDays = Math.max(totalDaysSinceStart - smokingDates.size(), 0);
        
        // Điểm cơ bản cho ngày không hút thuốc
        points += actualSmokFreeDays DAILY_SMOKE_FREE_POINTS;
        
        // Điểm thưởng cho chuỗi ngày liên tiếp
        points += consecutiveSmokFreeDays STREAK_BONUS_POINTS;
        
        // Điểm thưởng cho chuỗi tuần và tháng
        points += (consecutiveSmokFreeDays / 7) WEEKLY_STREAK_BONUS;
        points += (consecutiveSmokFreeDays / 30) MONTHLY_STREAK_BONUS;
        
        // Điểm thưởng cho ghi lại cảm giác thèm thuốc
        points += countCravingRecords(trackingEntries) CRAVING_RECORD_POINTS;
        
        // Điểm phạt cho việc hút thuốc
        points -= countSmokingIncidents(trackingEntries) SMOKING_PENALTY;
        
        return points;
    }

    //  === LẤY DANH SÁCH CÁC NGÀY HÚT THUỐC (KHÔNG TRÙNG LẶP) ===
    //  
    //  Method tạo Set chứa các ngày user đã hút thuốc.
    //  Dùng Set để tự động loại bỏ trùng lặp (nếu user log nhiều lần trong 1 ngày).
    //  
    //  STREAM PROCESSING:
    //  1. Filter: Chỉ lấy tracking type = "smoking"
    //  2. Map: Convert thành LocalDate
    //  3. Filter: Loại bỏ null values
    //  4. Collect: Thành Set (auto-deduplicate)
    //  
    //  LÝ DO DÙNG SET:
    //  - Nếu user log "hút thuốc" nhiều lần trong 1 ngày
    //  - Chỉ tính 1 ngày hút thuốc, không phạt nhiều lần
    //  - Fair và reasonable cho user
    //  
    //  trackingEntries Danh sách tracking để extract
    //  return Set các ngày đã hút thuốc (unique)
    private Set<LocalDate> getSmokingDates(List<Tracking> trackingEntries) {
        return trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(this::parseTrackingDate)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet()); // Tự động loại bỏ duplicate
    }

    //  === ĐẾM SỐ LẦN GHI LẠI CẢM GIÁC THÈM THUỐC ===
    //  
    //  Method đếm số lần user đã ghi lại cảm giác thèm thuốc.
    //  Mục đích khuyến khích self-awareness và mindfulness.
    //  
    //  LÝ DO THƯỞNG ĐIỂM:
    //  - Ghi lại cảm giác thèm giúp user nhận biết trigger
    //  - Thay vì né tránh, đối mặt với cảm giác
    //  - Tăng khả năng kiểm soát bản thân
    //  - Positive reinforcement cho hành vi tốt
    //  
    //  trackingEntries Danh sách tracking để đếm
    //  return Số lần ghi lại cảm giác thèm
    private int countCravingRecords(List<Tracking> trackingEntries) {
        return (int) trackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
    }

    //  === ĐẾM SỐ LẦN HÚT THUỐC ===
    //  
    //  Method đếm số lần user đã ghi nhận hút thuốc.
    //  Dùng để tính điểm phạt trong hệ thống.
    //  
    //  LÝ DO PHẠT ĐIỂM:
    //  - Tạo consequence cho hành vi không mong muốn
    //  - Negative reinforcement
    //  - Balance với các điểm thưởng
    //  - Động lực để tránh hút thuốc
    //  
    //  trackingEntries Danh sách tracking để đếm
    //  return Số lần hút thuốc
    private int countSmokingIncidents(List<Tracking> trackingEntries) {
        return (int) trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
    }

    //  === TÍNH ĐIỂM TRONG 7 NGÀY GẦN NHẤT ===
    //  
    //  Method tính điểm cho bảng xếp hạng tuần.
    //  Chỉ xét hoạt động trong 7 ngày gần nhất hoặc từ ngày bắt đầu bỏ thuốc.
    //  
    //  LOGIC THỜI GIAN:
    //  - weekAgo = hôm nay - 7 ngày
    //  - effectiveStartDate = max(startDate, weekAgo)
    //  - Chỉ tính tracking trong khoảng [effectiveStartDate, now]
    //  
    //  ĐIỂM SỐ TUẦN:
    //  - Điểm cơ bản: số ngày không hút thuốc × 10
    //  - Thưởng tuần: nếu cả 7 ngày không hút thuốc × 40
    //  - Thưởng craving: số lần ghi lại × 4
    //  - Phạt smoking: số lần hút thuốc × 15
    //  
    //   allTrackingEntries Tất cả tracking entries
    //   startDate Ngày bắt đầu bỏ thuốc
    //   return Điểm trong 7 ngày gần nhất
    private int calculateWeeklyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        LocalDate effectiveStartDate = startDate.isAfter(weekAgo) ? startDate : weekAgo;
        
        // Lọc tracking trong khoảng thời gian tuần
        List<Tracking> weeklyEntries = filterTrackingByDateRange(allTrackingEntries, effectiveStartDate, LocalDate.now());
        
        // Tính điểm với các tham số cụ thể cho tuần
        return calculatePointsForPeriod(weeklyEntries, effectiveStartDate, 7, WEEKLY_DAILY_POINTS, true, false);
    }

    //  === TÍNH ĐIỂM TRONG 30 NGÀY GẦN NHẤT ===
    //  
    //  Method tính điểm cho bảng xếp hạng tháng.
    //  Tương tự như weekly nhưng với phạm vi 30 ngày.
    //  
    //  ĐIỂM SỐ THÁNG:
    //  - Điểm cơ bản: số ngày không hút thuốc × 10
    //  - Thưởng tuần: mỗi chuỗi 7 ngày × 40
    //  - Thưởng tháng: nếu cả 30 ngày không hút thuốc × 150
    //  - Thưởng craving: số lần ghi lại × 4
    //  - Phạt smoking: số lần hút thuốc × 15
    //  
    //   allTrackingEntries Tất cả tracking entries
    //   startDate Ngày bắt đầu bỏ thuốc
    //   return Điểm trong 30 ngày gần nhất
    private int calculateMonthlyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        LocalDate effectiveStartDate = startDate.isAfter(monthAgo) ? startDate : monthAgo;
        
        // Lọc tracking trong khoảng thời gian tháng
        List<Tracking> monthlyEntries = filterTrackingByDateRange(allTrackingEntries, effectiveStartDate, LocalDate.now());
        
        // Tính điểm với các tham số cụ thể cho tháng
        return calculatePointsForPeriod(monthlyEntries, effectiveStartDate, 30, MONTHLY_DAILY_POINTS, true, true);
    }

    //  === LỌC TRACKING ENTRIES THEO KHOẢNG THỜI GIAN ===
    //  
    //  Helper method để lọc tracking entries trong một khoảng thời gian cụ thể.
    //  Dùng chung cho cả weekly và monthly calculations.
    //  
    //  LOGIC LỌC:
    //  - Parse ngày từ tracking
    //  - Kiểm tra nằm trong khoảng [startDate, endDate]
    //  - Bao gồm cả startDate và endDate
    //  
    //   trackingEntries Danh sách gốc cần lọc
    //   startDate Ngày bắt đầu khoảng thời gian
    //   endDate Ngày kết thúc khoảng thời gian
    //   return Danh sách tracking đã lọc
    private List<Tracking> filterTrackingByDateRange(List<Tracking> trackingEntries, LocalDate startDate, LocalDate endDate) {
        return trackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        return trackingDate.isAfter(startDate.minusDays(1)) && 
                               trackingDate.isBefore(endDate.plusDays(1));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    //  === TÍNH ĐIỂM CHO MỘT KHOẢNG THỜI GIAN CỤ THỂ ===
    //  
    //  Method generic để tính điểm cho bất kỳ khoảng thời gian nào.
    //  Được dùng chung bởi weekly và monthly calculations.
    //  
    //  CÁC THAM SỐ:
    //   trackingEntries Tracking data trong khoảng thời gian
    //   startDate Ngày bắt đầu khoảng thời gian
    //   maxDays Số ngày tối đa trong khoảng (7 cho tuần, 30 cho tháng)
    //   dailyPoints Điểm cho mỗi ngày không hút thuốc
    //   weeklyBonus Có tính thưởng 7 ngày liên tiếp không
    //   monthlyBonus Có tính thưởng tháng không
    //  return Tổng điểm trong khoảng thời gian
    private int calculatePointsForPeriod(List<Tracking> trackingEntries, LocalDate startDate, int maxDays, 
                                       int dailyPoints, boolean weeklyBonus, boolean monthlyBonus) {
        int points = 0;
        
        // Tính số ngày thực tế trong khoảng
        int daysInPeriod = Math.min((int) ChronoUnit.DAYS.between(startDate, LocalDate.now()), maxDays);
        Set<LocalDate> smokingDates = getSmokingDates(trackingEntries);
        
        // Tính số ngày không hút thuốc
        int smokeFreeDays = calculateSmokeFreeDaysInPeriod(startDate, daysInPeriod, smokingDates);
        
        // Điểm cơ bản
        points += smokeFreeDays dailyPoints;
        
        // Điểm thưởng tuần
        if (weeklyBonus && smokeFreeDays >= 7 && smokingDates.isEmpty()) {
            points += WEEKLY_STREAK_BONUS;
        }
        
        // Điểm thưởng tháng 
        if (monthlyBonus) {
            points += (smokeFreeDays / 7) WEEKLY_STREAK_BONUS; // Thưởng mỗi tuần
            if (smokeFreeDays >= 30 && smokingDates.isEmpty()) {
                points += MONTHLY_STREAK_BONUS; // Thưởng tháng hoàn chỉnh
            }
        }
        
        // Điểm thưởng và phạt
        points += countCravingRecords(trackingEntries) CRAVING_RECORD_POINTS;
        points -= countSmokingIncidents(trackingEntries) SMOKING_PENALTY;
        
        return points;
    }

    //  === TÍNH SỐ NGÀY KHÔNG HÚT THUỐC TRONG KHOẢNG THỜI GIAN ===
    //  
    //  Method đếm số ngày không hút thuốc trong một khoảng thời gian cụ thể.
    //  Lặp qua từng ngày và kiểm tra có trong danh sách ngày hút thuốc không.
    //  
    //  CÁCH HOẠT ĐỘNG:
    //  - Loop từ startDate đến startDate + totalDays
    //  - Mỗi ngày, kiểm tra có trong smokingDates Set không
    //  - Nếu không có → tăng counter
    //  
    //   startDate Ngày bắt đầu khoảng thời gian
    //   totalDays Tổng số ngày cần kiểm tra
    //   smokingDates Set các ngày đã hút thuốc
    //   return Số ngày không hút thuốc
    private int calculateSmokeFreeDaysInPeriod(LocalDate startDate, int totalDays, Set<LocalDate> smokingDates) {
        int smokeFreeDays = 0;
        for (int i = 0; i < totalDays; i++) {
            LocalDate dayToCheck = startDate.plusDays(i);
            if (!smokingDates.contains(dayToCheck)) {
                smokeFreeDays++;
            }
        }
        return smokeFreeDays;
    }

    //  === XÁC ĐỊNH TIER DỰA TRÊN PHẠM VI THỜI GIAN ===
    //  
    //  Method chọn loại điểm phù hợp để tính tier dựa trên timeRange.
    //  
    //  LOGIC:
    //  - "weekly" → dùng weeklyPoints
    //  - "monthly" → dùng monthlyPoints  
    //  - "all" → dùng totalPoints
    //  
    //  LÝ DO: Tier phải phù hợp với bảng xếp hạng đang xem
    //  
    //   timeRange Phạm vi thời gian
    //   totalPoints Tổng điểm
    //   weeklyPoints Điểm tuần
    //   monthlyPoints Điểm tháng
    //   return Tier string
    private String calculateTierByTimeRange(String timeRange, int totalPoints, int weeklyPoints, int monthlyPoints) {
    switch (timeRange) {
        case "weekly":
            return calculateTier(weeklyPoints);
        case "monthly":
            return calculateTier(monthlyPoints);
        default:
            return calculateTier(totalPoints);
        }
    }
    //  Xác định hạng của người dùng dựa trên điểm số.
    private String calculateTier(int points) {
        if (points >= 1800) return "Legend";
        else if (points >= 1000) return "Diamond";
        else if (points >= 500) return "Platinum";
        else if (points >= 250) return "Gold";
        else if (points >= 80) return "Silver";
        else if (points >= 0) return "Bronze";
        else return "Struggling";
    }

    //  === SẮP XẾP NGƯỜI DÙNG THEO PHẠM VI THỜI GIAN ===
    //  
    //  Method này sắp xếp danh sách người dùng theo điểm số từ CAO xuống THẤP
    //  dựa trên phạm vi thời gian được chọn.
    //  
    //  CÁCH HOẠT ĐỘNG:
    //  Giống như sắp xếp học sinh theo điểm thi, nhưng có 3 loại điểm khác nhau:
    //  - Điểm kiểm tra tuần (weekly)
    //  - Điểm kiểm tra tháng (monthly)  
    //  - Điểm tổng kết cả năm (all time)
    //  
    //  THUẬT TOÁN SẮP XẾP:
    //  - Sử dụng Java List.sort() với custom comparator
    //  - Integer.compare(b, a): So sánh 2 số nguyên
    //  - Đảo vị trí (b, a) thay vì (a, b) để sắp xếp GIẢM DẦN
    //  - users.sort(): Sắp xếp IN-PLACE (thay đổi list gốc)
    //  
    //  CÁC TRƯỜNG HỢP:
    //  1. "weekly": Sắp xếp theo weeklyPoints (điểm 7 ngày gần nhất)
    //  2. "monthly": Sắp xếp theo monthlyPoints (điểm 30 ngày gần nhất)
    //  3. "all" (default): Sắp xếp theo totalPoints (tổng điểm từ trước đến nay)
    //  
    //  VÍ DỤ:
    //  - Input: [User1(50pts), User2(100pts), User3(75pts)]
    //  - Output: [User2(100pts), User3(75pts), User1(50pts)]
    //  
    //  LÝ DO QUAN TRỌNG:
    //  - Người có điểm cao nhất sẽ đứng đầu bảng xếp hạng (rank 1)
    //  - Frontend sẽ hiển thị theo thứ tự này
    //  - User có động lực cạnh tranh để lên top
    //  
    //   users Danh sách người dùng cần sắp xếp (sẽ bị thay đổi)
    //   timeRange Phạm vi thời gian để chọn loại điểm phù hợp
    private void sortUsersByTimeRange(List<LeaderboardUserDTO> users, String timeRange) {
    switch (timeRange) {
        case "weekly":
            // Sắp xếp theo điểm tuần: người có điểm tuần cao nhất lên đầu
            users.sort((a, b) -> Integer.compare(b.getWeeklyPoints(), a.getWeeklyPoints()));
            break;
        case "monthly":
            // Sắp xếp theo điểm tháng: người có điểm tháng cao nhất lên đầu
            users.sort((a, b) -> Integer.compare(b.getMonthlyPoints(), a.getMonthlyPoints()));
            break;
        default:
            // Sắp xếp theo tổng điểm: người có tổng điểm cao nhất lên đầu
            users.sort((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()));
            break;
        }
    }

    //  === GÁN THỨ HẠNG CHO CÁC NGƯỜI DÙNG ===
    //  
    //  Method này gán thứ hạng (rank) cho từng người dùng sau khi đã sắp xếp.
    //  Đây là bước CUỐI CÙNG để hoàn thiện bảng xếp hạng.
    //  
    //  CÁCH HOẠT ĐỘNG:
    //  Như việc phát huy chương cho VĐV sau khi đã xếp hạng:
    //  - Người đứng đầu danh sách (index 0) = Hạng 1 (HCV)
    //  - Người thứ 2 (index 1) = Hạng 2 (HCB) 
    //  - Người thứ 3 (index 2) = Hạng 3 (HCĐ)
    //  - ...và tiếp tục
    //  
    //  THUẬT TOÁN:
    //  - Dùng vòng lặp for đơn giản
    //  - Index của mảng + 1 = Rank (vì index bắt đầu từ 0)
    //  - setRank(): Gán rank vào object LeaderboardUserDTO
    //  
    //  TẠI SAO PHẢI GÁN RIÊNG:
    //  - Sau khi sort, vị trí trong list là thứ hạng
    //  - Nhưng object không tự biết vị trí của mình
    //  - Phải explicitly gán rank để frontend hiển thị số thứ hạng
    //  
    //  VÍ DỤ:
    //  - users[0] → setRank(1) → "🥇 #1"
    //  - users[1] → setRank(2) → "🥈 #2"  
    //  - users[2] → setRank(3) → "🥉 #3"
    //  - users[3] → setRank(4) → "#4"
    //  
    //  FRONTEND SỬ DỤNG:
    //  - Hiển thị số thứ hạng bên cạnh tên user
    //  - Có thể thêm icon đặc biệt cho top 3
    //  - Highlight rank của current user
    //  
    //  users Danh sách đã được sắp xếp theo điểm số
    private void assignRanks(List<LeaderboardUserDTO> users) {
        for (int i = 0; i < users.size(); i++) {
            // Gán rank = index + 1 (vì index bắt đầu từ 0, rank bắt đầu từ 1)
            users.get(i).setRank(i + 1);
        }
    }

    //  === TÌM NGƯỜI DÙNG HIỆN TẠI TRONG DANH SÁCH ===
    //  
    //  Method này tìm thông tin của người dùng đang đăng nhập trong bảng xếp hạng.
    //  Mục đích để frontend có thể HIGHLIGHT vị trí của user hiện tại.
    //  
    //  TÍNH NĂNG "TÌM TÔI Ở ĐÂU":
    //  Giống như trong một buổi thi, sau khi có kết quả, bạn muốn biết:
    //  - "Tôi đứng thứ mấy?"
    //  - "Điểm số của tôi là bao nhiêu?"
    //  - "Tôi thuộc hạng gì?"
    //  
    //  CÁCH TÌM KIẾM:
    //  - Sử dụng Java Stream API (functional programming)
    //  - .filter(): Lọc ra những user có ID trùng với currentUserId
    //  - .findFirst(): Lấy kết quả đầu tiên tìm được
    //  - .orElse(null): Nếu không tìm thấy thì trả về null
    //  
    //  CÁC TRƯỜNG HỢP:
    //  1. currentUserId = null:
    //     → User chưa đăng nhập hoặc không truyền ID
    //     → Trả về null (không highlight ai)
    //  
    //  2. Tìm thấy user:
    //     → Trả về LeaderboardUserDTO đầy đủ thông tin
    //     → Bao gồm: rank, điểm số, tier, etc.
    //  
    //  3. Không tìm thấy:
    //     → User không có trong bảng xếp hạng
    //     → Có thể user bị lọc ra (không phải role USER)
    //     → Trả về null
    //  
    //  
    //  users Danh sách đầy đủ bảng xếp hạng (đã có rank)
    //  currentUserId ID của user đang đăng nhập
    //  return LeaderboardUserDTO của current user hoặc null
    private LeaderboardUserDTO findCurrentUser(List<LeaderboardUserDTO> users, Integer currentUserId) {
        // Kiểm tra trường hợp currentUserId null
        if (currentUserId == null) {
            return null;
        }
        
        // Sử dụng Stream API để tìm kiếm
        return users.stream()
                .filter(u -> u.getId().equals(currentUserId)) // Lọc user có ID khớp
                .findFirst()                                  // Lấy user đầu tiên tìm được
                .orElse(null);                                // Nếu không tìm thấy, trả về null
    }

    //  === TẠO RESPONSE CHO LEADERBOARD ===
    //  
    //  Method này đóng gói tất cả dữ liệu thành một Map để trả về cho Controller.
    //  Đây là bước CUỐI CÙNG trước khi gửi response về frontend.
    //  
    //  STRUCTURE CỦA RESPONSE:
    //  {
    //    "leaderboard": [        // Danh sách toàn bộ bảng xếp hạng
    //      {
    //        "id": 1,
    //        "name": "Nguyễn Văn A",
    //        "rank": 1,
    //        "totalPoints": 850,
    //        "weeklyPoints": 70,
    //        "monthlyPoints": 300,
    //        "tier": "Gold",
    //        "consecutiveSmokFreeDays": 15,
    //        "startDate": "2025-01-01",
    //        "avatarUrl": "https://..."
    //      },
    //      // ... more users
    //    ],
    //    "currentUser": {        // Thông tin user hiện tại (để highlight)
    //      // Same structure as above
    //    },
    //    "timeRange": "weekly"   // Phạm vi thời gian đang xem
    //  }
    //  
    //   leaderboard Danh sách đầy đủ đã sắp xếp và có rank
    //   currentUser Thông tin user hiện tại (có thể null)
    //   timeRange Phạm vi thời gian đang xem
    //   return Map chứa toàn bộ response data
    private Map<String, Object> createLeaderboardResponse(List<LeaderboardUserDTO> leaderboard, 
                                                        LeaderboardUserDTO currentUser, String timeRange) {
        // Tạo HashMap để chứa response data
        Map<String, Object> response = new HashMap<>();

        // Đóng gói các field cần thiết
        response.put("leaderboard", leaderboard);  // Danh sách chính
        response.put("currentUser", currentUser);  // User hiện tại
        response.put("timeRange", timeRange);      // Phạm vi thời gian hiện tại
        return response;
    }
}