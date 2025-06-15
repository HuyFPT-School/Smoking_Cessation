package com.example.demo.Controller;

import com.example.demo.DTO.LeaderboardUserDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Post;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController //Đánh dấu lớp này là một REST controller, xử lý các HTTP request và trả về dữ liệu dưới dạng JSON
@CrossOrigin //Cho phép các domain khác gọi API này
@RequestMapping("/api/leaderboard") //Xác định đường dẫn cơ sở cho tất cả các endpoint trong controller này
public class LeaderboardController {

    //lấy thông tin từ cơ sở dữ liệu.
    // Repository để truy vấn bảng trong cơ sở dữ liệu

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private TrackingRepo trackingRepo;

    @Autowired
    private PostRepo postRepo;   
    // === HÀM LẤY DỮ LIỆU BẢNG XẾP HẠNG ===

    // Đây là hàm chính để hiển thị bảng xếp hạng cho ứng dụng. 
    // Khi người dùng truy cập vào trang Bảng xếp hạng, hàm này sẽ được gọi.

    // THAM SỐ ĐẦU VÀO:
    // timeRange: Phạm vi thời gian (weekly: 7 ngày, monthly: 30 ngày, all: tất cả thời gian)
    // currentUserId: ID của người dùng hiện tại (để đánh dấu vị trí của họ)

    // QUY TRÌNH HOẠT ĐỘNG:
    // 1. Lấy danh sách tất cả người dùng
    // 2. Tính điểm số cho mỗi người dùng (dựa trên phạm vi thời gian)
    // 3. Sắp xếp danh sách theo điểm số từ cao xuống thấp
    // 4. Gán thứ hạng cho từng người dùng (1, 2, 3, ...)
    // 5. Xác định vị trí của người dùng hiện tại trong bảng xếp hạng
    // 6. Trả về kết quả hoàn chỉnh

    //@RequestParam: Đánh dấu tham số được truyền qua URL query string
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(defaultValue = "weekly") String timeRange,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            // Kiểm tra tham số phạm vi thời gian có hợp lệ không
            // Arrays.asList(): Tạo danh sách cố định từ các phần tử được liệt kê
            // contains(): Kiểm tra xem giá trị timeRange có nằm trong danh sách không
            if (!Arrays.asList("weekly", "monthly", "all").contains(timeRange)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid timeRange. Must be: weekly, monthly, or all"));
            }

            // Lấy tất cả người dùng từ cơ sở dữ liệu
            List<User> allUsers = userRepo.findAll();
            if (allUsers.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "leaderboard", new ArrayList<>(),  // ArrayList<>(): Tạo danh sách rỗng
                    "currentUser", null,               // Không có người dùng hiện tại
                    "timeRange", timeRange             // Vẫn trả về phạm vi thời gian đã chọn
                ));
            }

            // Danh sách để lưu thông tin người dùng trên bảng xếp hạng
            List<LeaderboardUserDTO> leaderboardUsers = new ArrayList<>();

             // Tính toán điểm số cho mỗi người dùng
            for (User user : allUsers) {
                try {
                    // Gọi phương thức tính toán thống kê cho mỗi người dùng
                    LeaderboardUserDTO leaderboardUser = calculateUserStats(user, timeRange);
                    if (leaderboardUser != null) {
                        // Thêm người dùng vào danh sách bảng xếp hạng
                        leaderboardUsers.add(leaderboardUser);
                    }
                } catch (Exception e) {
                    System.err.println("Error calculating stats for user " + user.getId() + ": " + e.getMessage());
                }
            }

            // Sắp xếp danh sách người dùng theo điểm số (từ cao xuống thấp)
            // dựa trên phạm vi thời gian được chọn
            // switch expression: Chọn cách sắp xếp dựa trên giá trị timeRange
            switch (timeRange) {
                case "weekly":
                    // sort(): Sắp xếp danh sách. Tham số là một Comparator (hàm so sánh)
                    // Integer.compare(): So sánh hai số nguyên, trả về âm, dương hoặc 0
                    // .getWeeklyPoints(): Lấy điểm tuần của người dùng
                    // Đảo thứ tự b và a để sắp xếp giảm dần
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getWeeklyPoints(), a.getWeeklyPoints()));
                    break;
                case "monthly":
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getMonthlyPoints(), a.getMonthlyPoints()));
                    break;
                default: // "all"
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()));
                    break;
            }

            // Gán thứ hạng cho từng người dùng (người đầu tiên là hạng 1)
            for (int i = 0; i < leaderboardUsers.size(); i++) {
                // Thứ hạng là chỉ số mảng + 1 (vì chỉ số mảng bắt đầu từ 0)
                leaderboardUsers.get(i).setRank(i + 1);
            }

            // Tìm vị trí của người dùng hiện tại trong bảng xếp hạng
            LeaderboardUserDTO currentUser = null;
            if (currentUserId != null) {
                currentUser = leaderboardUsers.stream()
                        .filter(u -> u.getId().equals(currentUserId))
                        .findFirst()
                        .orElse(null);
            }

            // Tạo kết quả cuối cùng để trả về
            Map<String, Object> response = new HashMap<>();
            response.put("leaderboard", leaderboardUsers);  // put(): Thêm cặp key-value vào Map
            response.put("currentUser", currentUser);       // Thông tin người dùng hiện tại
            response.put("timeRange", timeRange);           // Phạm vi thời gian đang xem

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Leaderboard error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to fetch leaderboard: " + e.getMessage()));
        }
    }

    /**
     * === HÀM TÍNH ĐIỂM SỐ CHO MỖI NGƯỜI DÙNG ===
     *
     * Hàm này tính toán các thông số thành tích của một người dùng, bao gồm:
     * - Điểm số (theo tuần, tháng, và tổng)
     * - Số ngày không hút thuốc liên tiếp
     * - Ngày bắt đầu bỏ thuốc
     * - Hạng của người dùng (Đồng, Bạc, Vàng, ...)
     *
     * QUY TRÌNH HOẠT ĐỘNG:
     * 1. Lấy thông tin cơ bản của người dùng (tên, ảnh đại diện)
     * 2. Xác định ngày bắt đầu bỏ thuốc (từ kế hoạch hoặc ngày đăng ký)
     * 3. Lấy lịch sử theo dõi của người dùng (ghi nhận hút thuốc, cảm giác thèm thuốc)
     * 4. Tính số ngày không hút thuốc liên tiếp
     * 5. Tính điểm số cho các phạm vi thời gian khác nhau
     * 6. Xác định hạng của người dùng dựa trên tổng điểm
     * 
     * user - Đối tượng User chứa thông tin người dùng
     * timeRange - Phạm vi thời gian đang xem (weekly, monthly, all)
     * LeaderboardUserDTO - Đối tượng chứa thông tin người dùng cho bảng xếp hạng
     */

    private LeaderboardUserDTO calculateUserStats(User user, String timeRange) {
        try {
            // Tạo đối tượng chứa thông tin người dùng cho bảng xếp hạng
            LeaderboardUserDTO userStats = new LeaderboardUserDTO();
             // Thiết lập thông tin cơ bản: ID, tên, và ảnh đại diện
            userStats.setId(user.getId());
            userStats.setName(user.getName());
            userStats.setAvatarUrl(user.getAvatarUrl());

            // Xác định ngày bắt đầu bỏ thuốc
            LocalDate startDate = LocalDate.now(); 
            String startDateString = null;

            try {
                // Ưu tiên 1: Lấy ngày bỏ thuốc từ Kế hoạch (Plan)
                Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(user.getId()));
                if (planOpt.isPresent()) {
                    // isPresent(): Kiểm tra xem Optional có chứa giá trị không
                    Plan plan = planOpt.get();
                    // Kiểm tra và lấy ngày bỏ thuốc từ Plan nếu có
                    if (plan.getQuitDate() != null) {
                        startDate = plan.getQuitDate();
                        startDateString = startDate.toString();
                    }
                }
                
                // Ưu tiên 2: Sử dụng ngày đăng ký của người dùng nếu không có Plan hoặc không có quitDate
                if (startDateString == null && user.getCreateAt() != null) {
                    startDate = user.getCreateAt().toLocalDate();
                    startDateString = startDate.toString();
                }
                
                // Ưu tiên 3: Nếu không có ngày bắt đầu, sử dụng ngày hiện tại
                if (startDateString == null) {
                    startDate = LocalDate.now();
                    startDateString = startDate.toString();
                }
            } catch (Exception e) {
                System.err.println("Error determining start date for user " + user.getId() + ": " + e.getMessage());
                // Fallback về ngày hiện tại
                startDate = LocalDate.now();
                startDateString = startDate.toString();
            }

            // Tính tổng số ngày kể từ ngày bắt đầu bỏ thuốc
            // ChronoUnit.DAYS.between(): Tính số ngày giữa hai ngày
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
            if (totalDaysSinceQuit < 0) totalDaysSinceQuit = 0;

            final LocalDate finalStartDate = startDate;

            // Lấy tất cả các Tracking
            List<Tracking> allTrackingEntries = new ArrayList<>();
            try {
                // Lấy tất cả bản ghi tracking của user từ database
                allTrackingEntries = trackingRepo.findByUserId(user.getId())
                        .stream()
                        .filter(tracking -> {
                            if (tracking == null || tracking.getDate() == null || tracking.getDate().trim().isEmpty()) {
                                return false;
                            }
                            try {
                                LocalDate trackingDate = LocalDate.parse(tracking.getDate().trim());
                                // Chỉ giữ lại các bản ghi từ sau ngày bắt đầu bỏ thuốc
                                // minusDays(1): Để tính cả ngày bắt đầu
                                return trackingDate.isAfter(finalStartDate.minusDays(1));
                            } catch (Exception e) {
                                System.err.println("Invalid date format for tracking: " + tracking.getDate());
                                return false;
                            }
                        })
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error fetching tracking entries for user " + user.getId() + ": " + e.getMessage());
                allTrackingEntries = new ArrayList<>();
            }

            // Tính số ngày không hút thuốc liên tiếp hiện tại
            int consecutiveSmokFreeDays = calculateCurrentStreakDays(allTrackingEntries, finalStartDate);

             // Tính điểm số dựa trên phạm vi thời gian
            int totalPoints = calculateTotalPoints(allTrackingEntries, consecutiveSmokFreeDays, finalStartDate);
            int weeklyPoints = calculateWeeklyPoints(allTrackingEntries, finalStartDate);
            int monthlyPoints = calculateMonthlyPoints(allTrackingEntries, finalStartDate);
            
            // Thiết lập các giá trị cho đối tượng kết quả
            userStats.setTotalPoints(totalPoints);      // Tổng điểm
            userStats.setWeeklyPoints(weeklyPoints);    // Điểm tuần
            userStats.setMonthlyPoints(monthlyPoints);  // Điểm tháng
            userStats.setStartDate(startDateString);    // Ngày bắt đầu bỏ thuốc
            userStats.setTotalDaysSinceQuit(totalDaysSinceQuit);   // Tổng số ngày từ khi bắt đầu
            userStats.setConsecutiveSmokFreeDays(consecutiveSmokFreeDays);   // Số ngày chuỗi hiện tại
            userStats.setTier(calculateTier(totalPoints));   // Xác định hạng dựa trên tổng điểm

            return userStats;  // Trả về đối tượng chứa thông tin điểm và hạng của người dùng
        } catch (Exception e) {
            System.err.println("Error calculating user stats for user " + user.getId() + ": " + e.getMessage());
            return null;
        }
    } 
    
    // === HÀM TÍNH SỐ NGÀY KHÔNG HÚT THUỐC LIÊN TIẾP === 
    //  Hàm này tính số ngày liên tiếp không hút thuốc tính đến hiện tại.
    //  Đây là "chuỗi ngày không hút thuốc" hiện tại của người dùng.
    //  CÁCH TÍNH:
    //   1. Tìm ngày hút thuốc gần nhất trong lịch sử theo dõi
    //   2. Nếu có ngày hút thuốc gần nhất:
    //      - Chuỗi bắt đầu từ ngày sau ngày hút thuốc gần nhất
    //   3. Nếu không có ngày hút thuốc nào:
    //      - Chuỗi bắt đầu từ ngày bắt đầu bỏ thuốc
    //   4. Tính số ngày từ ngày bắt đầu chuỗi đến ngày hiện tại
    //  
    //   Ví dụ:
    //   - Ngày bắt đầu bỏ thuốc: 01/01/2025
    //   - Ngày hút thuốc gần nhất: 10/01/2025
    //   - Ngày hiện tại: 20/01/2025
    //   => Chuỗi ngày không hút thuốc: 9 ngày (từ 11/01/2025 đến 20/01/2025)
    //   
    //   trackingEntries - Danh sách các bản ghi theo dõi của người dùng
    //   startDate - Ngày bắt đầu bỏ thuốc
    //   return Số ngày không hút thuốc liên tiếp tính đến hiện tại

    private int calculateCurrentStreakDays(List<Tracking> trackingEntries, LocalDate startDate) {
        try {
            // Tìm ngày hút thuốc gần nhất
            Optional<LocalDate> lastSmokingDate = trackingEntries.stream()
                    .filter(tracking -> tracking != null && "smoking".equals(tracking.getType()))
                    .map(tracking -> {
                        try {
                            return tracking.getDate() != null ? LocalDate.parse(tracking.getDate().trim()) : null;
                        } catch (Exception e) {
                            System.err.println("Invalid date format in smoking tracking: " + tracking.getDate());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull) // filter(Objects::nonNull): Loại bỏ các giá trị null
                    .max(LocalDate::compareTo); // max(LocalDate::compareTo): Tìm ngày lớn nhất (gần đây nhất)
            
            // Xác định ngày bắt đầu chuỗi không hút thuốc hiện tại
            LocalDate streakStartDate;

            if (lastSmokingDate.isPresent()) {
                // Nếu có ngày hút thuốc gần nhất, chuỗi bắt đầu từ ngày tiếp theo
                // plusDays(1): Thêm 1 ngày vào ngày hút thuốc gần nhất
                streakStartDate = lastSmokingDate.get().plusDays(1);
            } else {
                // Nếu không có ngày hút thuốc nào, chuỗi bắt đầu từ ngày bắt đầu bỏ thuốc
                streakStartDate = startDate;
            }
            
            // Tính số ngày từ ngày bắt đầu chuỗi đến hiện tại
            int streakDays = (int) ChronoUnit.DAYS.between(streakStartDate, LocalDate.now());
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
            
            // Nếu ngày hút thuốc gần nhất là ngày hôm nay, chuỗi ngày = 0
            if (lastSmokingDate.isPresent() && lastSmokingDate.get().equals(LocalDate.now())) {
                return 0;
            }
            
            // Đảm bảo số ngày chuỗi không âm và không vượt quá tổng số ngày bỏ thuốc
            // Math.max(): Trả về giá trị lớn hơn trong hai giá trị
            // Math.min(): Trả về giá trị nhỏ hơn trong hai giá trị
            return Math.max(Math.min(streakDays, totalDaysSinceQuit), 0);
        } catch (Exception e) {
            System.err.println("Error calculating streak days: " + e.getMessage());
            return 0;
        }
    }

    //   === HÀM TÍNH TỔNG ĐIỂM ===
    //   Hàm này tính tổng điểm của người dùng dựa trên toàn bộ tiến trình bỏ thuốc,
    //   kể từ ngày bắt đầu bỏ thuốc đến hiện tại.
    //  
    //   HỆ THỐNG TÍNH ĐIỂM:
    //   1. Điểm cơ bản cho ngày không hút thuốc:
    //      - Mỗi ngày không hút thuốc: +8 điểm
    //   
    //   2. Điểm thưởng cho chuỗi ngày liên tiếp:
    //      - Mỗi ngày trong chuỗi hiện tại: +2 điểm
    //      - Hoàn thành 7 ngày liên tiếp: +40 điểm thưởng
    //      - Hoàn thành 30 ngày liên tiếp: +150 điểm thưởng
    //  
    //   3. Điểm thưởng cho việc ghi lại cảm giác thèm thuốc:
    //      - Mỗi lần ghi lại cảm giác thèm thuốc: +4 điểm
    //      (Khuyến khích người dùng nhận biết và đối diện với cảm giác thèm thuốc)
    //  
    //   4. Điểm phạt khi hút thuốc:
    //      - Mỗi lần ghi nhận hút thuốc: -15 điểm
    //  

    private int calculateTotalPoints(List<Tracking> trackingEntries, int consecutiveSmokFreeDays, LocalDate startDate) {
        int points = 0;
        
        // 1. Tính số ngày thực tế không hút thuốc (tổng số ngày trừ đi số ngày hút thuốc)
        // ChronoUnit.DAYS.between(): Tính số ngày giữa hai ngày
        int totalDaysSinceStart = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
        if (totalDaysSinceStart < 0) totalDaysSinceStart = 0;
        
        // Lấy danh sách các ngày hút thuốc (không trùng lặp)
        Set<LocalDate> smokingDates = trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull) // Loại bỏ các giá trị null
                .collect(Collectors.toSet()); // Chuyển thành Set để loại bỏ trùng lặp

        // Tính số ngày thực tế không hút thuốc: tổng số ngày trừ đi số ngày hút thuốc
        int actualSmokFreeDays = totalDaysSinceStart - smokingDates.size();
        actualSmokFreeDays = Math.max(actualSmokFreeDays, 0);
        
        // 2. Điểm cơ bản cho số ngày không hút thuốc (+8 điểm/ngày)
        points += actualSmokFreeDays * 8;
        
        // 3. Điểm thưởng cho chuỗi ngày liên tiếp (+2 điểm/ngày)
        points += consecutiveSmokFreeDays * 2;
        
        // 4. Điểm thưởng cho chuỗi 7 ngày (+40 điểm/tuần)
        // consecutiveSmokFreeDays / 7: Số lượng chuỗi 7 ngày hoàn chỉnh
        int weeklyStreaks = consecutiveSmokFreeDays / 7;
        points += weeklyStreaks * 40;
        
        // 5. Điểm thưởng cho chuỗi 30 ngày (+150 điểm/tháng)
        // consecutiveSmokFreeDays / 30: Số lượng chuỗi 30 ngày hoàn chỉnh
        int monthlyStreaks = consecutiveSmokFreeDays / 30;
        points += monthlyStreaks * 150;
        
        // 6. Điểm thưởng cho việc ghi lại cảm giác thèm thuốc (+4 điểm/lần)
        long cravingRecords = trackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) cravingRecords * 4;

        // 7. Áp dụng điểm phạt cho việc hút thuốc (-15 điểm/lần)
        long smokingIncidents = trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        
        int penalty = (int) smokingIncidents * 15;
        points = points - penalty;
        
        return points; // Trả về tổng điểm sau khi tính toán
    }

    //   === HÀM TÍNH ĐIỂM TRONG 7 NGÀY GẦN NHẤT ===
    //  
    //   Hàm này tính điểm của người dùng trong 7 ngày gần nhất.
    //   Điểm này được sử dụng cho bảng xếp hạng theo tuần.
    //  
    //   HỆ THỐNG TÍNH ĐIỂM HÀNG TUẦN:
    //   1. Điểm cơ bản cho ngày không hút thuốc:
    //      - Mỗi ngày không hút thuốc trong tuần: +10 điểm
    //   
    //   2. Điểm thưởng cho chuỗi 7 ngày:
    //      - Hoàn thành 7 ngày liên tiếp không hút thuốc: +40 điểm
    //  
    //   3. Điểm thưởng cho việc ghi lại cảm giác thèm thuốc:
    //      - Mỗi lần ghi lại cảm giác thèm thuốc trong tuần: +4 điểm
    //  
    //   4. Điểm phạt khi hút thuốc:
    //      - Mỗi lần ghi nhận hút thuốc trong tuần: -15 điểm
    //  
    //   Chỉ tính các hoạt động trong 7 ngày gần nhất, hoặc kể từ ngày bắt đầu 
    //   bỏ thuốc nếu mới bắt đầu chưa đủ 7 ngày.
    //  
    //  allTrackingEntries - Danh sách tất cả các bản ghi theo dõi
    //  startDate - Ngày bắt đầu bỏ thuốc
    //  return Điểm số của người dùng trong 7 ngày gần nhất

    private int calculateWeeklyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        // Xác định ngày bắt đầu tính điểm tuần (7 ngày trước hoặc ngày bắt đầu bỏ thuốc)
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        // Chọn ngày bắt đầu tính điểm là ngày gần đây hơn giữa startDate và weekAgo
        // isAfter(): So sánh một ngày có sau ngày khác không
        LocalDate effectiveStartDate = startDate.isAfter(weekAgo) ? startDate : weekAgo;
        // Lọc các bản ghi theo dõi trong 7 ngày gần nhất
        List<Tracking> weeklyTrackingEntries = allTrackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        // Chỉ lấy các bản ghi từ sau ngày bắt đầu tính điểm đến nay
                        // isAfter() và isBefore(): So sánh ngày tháng
                        // minusDays(1): Để tính cả ngày bắt đầu
                        // plusDays(1): Để tính cả ngày hiện tại
                        return trackingDate.isAfter(effectiveStartDate.minusDays(1)) && 
                               trackingDate.isBefore(LocalDate.now().plusDays(1));
                    } catch (Exception e) {
                        return false; // Bỏ qua bản ghi có định dạng ngày không hợp lệ
                    }
                })
                .collect(Collectors.toList()); // Chuyển stream thành List
        
        // Tính điểm cho tuần này
        int points = 0;
        
        // Tính số ngày trong khoảng thời gian đang xét
        int daysInWeek = (int) ChronoUnit.DAYS.between(effectiveStartDate, LocalDate.now());
        daysInWeek = Math.min(daysInWeek, 7);
        
        // Lấy các ngày hút thuốc trong tuần
        // Collectors.toSet(): Chuyển stream thành Set để loại bỏ trùng lặp
        Set<LocalDate> weeklySmokingDates = weeklyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Tính số ngày không hút thuốc trong tuần
        // Đếm số ngày trong khoảng thời gian mà không có trong danh sách ngày hút thuốc
        int smokeFreeDaysInWeek = 0;
        for (int i = 0; i < daysInWeek; i++) {
            // plusDays(i): Thêm i ngày vào ngày bắt đầu tính điểm
            LocalDate dayToCheck = effectiveStartDate.plusDays(i);
            // contains(): Kiểm tra xem Set có chứa phần tử không
            if (!weeklySmokingDates.contains(dayToCheck)) {
                smokeFreeDaysInWeek++;  // Tăng số ngày không hút thuốc
            }
        }
        // Điểm cơ bản cho ngày không hút thuốc (+10 điểm/ngày)
        points += smokeFreeDaysInWeek * 10;
        
        // Điểm thưởng cho chuỗi 7 ngày không hút thuốc (+40 điểm)
        // isEmpty(): Kiểm tra xem tập hợp có rỗng không
        if (smokeFreeDaysInWeek >= 7 && weeklySmokingDates.isEmpty()) {
            points += 40; // Thưởng 40 điểm nếu cả tuần không hút thuốc
        }
        
         // Điểm thưởng cho việc ghi lại cảm giác thèm thuốc (+4 điểm/lần)
        // count(): Đếm số lượng phần tử trong stream thỏa mãn điều kiện
        long weeklyCravingRecords = weeklyTrackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) weeklyCravingRecords * 4;

        // Áp dụng điểm phạt cho việc hút thuốc (-15 điểm/lần)
        long weeklySmokingIncidents = weeklyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        int penalty = (int) weeklySmokingIncidents * 15;
        points = points - penalty;
        
        return points; // Trả về điểm tuần
    }

    //   === HÀM TÍNH ĐIỂM TRONG 30 NGÀY GẦN NHẤT ===
    //  
    //   Hàm này tính điểm của người dùng trong 30 ngày gần nhất.
    //   Điểm này được sử dụng cho bảng xếp hạng theo tháng.
    //  
    //   HỆ THỐNG TÍNH ĐIỂM HÀNG THÁNG:
    //   1. Điểm cơ bản cho ngày không hút thuốc:
    //      - Mỗi ngày không hút thuốc trong tháng: +10 điểm
    //   
    //   2. Điểm thưởng cho chuỗi ngày:
    //     - Hoàn thành mỗi chuỗi 7 ngày trong tháng: +40 điểm
    //     - Hoàn thành chuỗi 30 ngày đầy đủ: +150 điểm
    //  
    //   3. Điểm thưởng cho việc ghi lại cảm giác thèm thuốc:
    //      - Mỗi lần ghi lại cảm giác thèm thuốc trong tháng: +4 điểm
    //  
    //   4. Điểm phạt khi hút thuốc:
    //      - Mỗi lần ghi nhận hút thuốc trong tháng: -15 điểm
    //  
    //   Chỉ tính các hoạt động trong 30 ngày gần nhất, hoặc kể từ ngày bắt đầu 
    //   bỏ thuốc nếu mới bắt đầu chưa đủ 30 ngày.
    //   
    //   allTrackingEntries - Danh sách tất cả các bản ghi theo dõi
    //   startDate - Ngày bắt đầu bỏ thuốc
    //   return Điểm số của người dùng trong 30 ngày gần nhất

    private int calculateMonthlyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        // Xác định ngày bắt đầu tính điểm tháng (30 ngày trước hoặc ngày bắt đầu bỏ thuốc)
        // LocalDate.now().minusDays(30): Lấy ngày 30 ngày trước hiện tại
        LocalDate monthAgo = LocalDate.now().minusDays(30);

        // Chọn ngày bắt đầu tính điểm là ngày gần đây hơn giữa startDate và monthAgo
        // isAfter(): So sánh một ngày có sau ngày khác không
        LocalDate effectiveStartDate = startDate.isAfter(monthAgo) ? startDate : monthAgo;
        
         // Lọc các bản ghi theo dõi trong 30 ngày gần nhất
        List<Tracking> monthlyTrackingEntries = allTrackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        return trackingDate.isAfter(effectiveStartDate.minusDays(1)) && 
                               trackingDate.isBefore(LocalDate.now().plusDays(1));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
        
        // Tính điểm cho tháng này
        int points = 0;
        
        // Tính số ngày trong khoảng thời gian đang xét
        int daysInMonth = (int) ChronoUnit.DAYS.between(effectiveStartDate, LocalDate.now());
        daysInMonth = Math.min(daysInMonth, 30);
        
        // Lấy các ngày hút thuốc trong tháng
        Set<LocalDate> monthlySmokingDates = monthlyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Tính số ngày không hút thuốc trong tháng
        int smokeFreeDaysInMonth = 0;
        for (int i = 0; i < daysInMonth; i++) {
            LocalDate dayToCheck = effectiveStartDate.plusDays(i);
            if (!monthlySmokingDates.contains(dayToCheck)) {
                smokeFreeDaysInMonth++;
            }
        }
        // Điểm cơ bản cho ngày không hút thuốc (+10 điểm/ngày)
        points += smokeFreeDaysInMonth * 10;
        
        // Điểm thưởng cho mỗi chuỗi 7 ngày trong tháng (+40 điểm/chuỗi)
        // smokeFreeDaysInMonth / 7: Số chuỗi 7 ngày hoàn chỉnh trong tháng
        int weeklyStreaks = smokeFreeDaysInMonth / 7;
        points += weeklyStreaks * 40;
        
        // Điểm thưởng cho chuỗi 30 ngày đầy đủ (+150 điểm)
        // isEmpty(): Kiểm tra xem tập hợp có rỗng không
        if (smokeFreeDaysInMonth >= 30 && monthlySmokingDates.isEmpty()) {
            points += 150; // 30-day streak bonus
        }
        
        // Điểm thưởng cho việc ghi lại cảm giác thèm thuốc (+4 điểm/lần)
        long monthlyCravingRecords = monthlyTrackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) monthlyCravingRecords * 4;
        // Áp dụng điểm phạt cho việc hút thuốc (-15 điểm/lần)
        long monthlySmokingIncidents = monthlyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        int penalty = (int) monthlySmokingIncidents * 15;
        points = points - penalty;
        
        return points; // Trả về điểm tháng
    }
    

    //  === HÀM XÁC ĐỊNH HẠNG CỦA NGƯỜI DÙNG ===
    //  
    //   Hàm này xác định hạng (tier) của người dùng dựa trên tổng điểm.
    //   Hạng phản ánh thành tích và sự tiến bộ của người dùng trên hành trình bỏ thuốc.
    //  
    //   CÁC HẠNG:
    //   - Legend (Huyền thoại): 1800+ điểm
    //     Dành cho những người có thành tích xuất sắc, duy trì thói quen không hút thuốc lâu dài.
    //  
    //   - Diamond (Kim cương): 1000-1799 điểm
    //     Dành cho những người có thành tích rất tốt, thường là những người đã bỏ thuốc nhiều tháng.
    //  
    //   - Platinum (Bạch kim): 500-999 điểm
    //     Dành cho những người có thành tích tốt, thường là những người đã bỏ thuốc vài tháng.
    //  
    //   - Gold (Vàng): 250-499 điểm
    //     Dành cho những người có thành tích khá, thường là những người đã bỏ thuốc vài tuần.
    //  
    //   - Silver (Bạc): 80-249 điểm
    //     Dành cho những người mới bắt đầu có tiến bộ, thường là những người đã bỏ thuốc vài ngày.
    //  
    //   - Bronze (Đồng): 0-79 điểm
    //     Dành cho những người mới bắt đầu hành trình bỏ thuốc.
    //  
    //   - Struggling (Đang vật lộn): Dưới 0 điểm
    //     Dành cho những người đang gặp khó khăn, có nhiều lần hút thuốc hơn ngày không hút.
    //   
    //   totalPoints - Tổng điểm của người dùng
    //   return Hạng của người dùng dưới dạng chuỗi

    private String calculateTier(int totalPoints) {
        if (totalPoints >= 1800) return "Legend";
        else if (totalPoints >= 1000) return "Diamond";
        else if (totalPoints >= 500) return "Platinum";
        else if (totalPoints >= 250) return "Gold";
        else if (totalPoints >= 80) return "Silver";
        else if (totalPoints >= 0) return "Bronze";
        else return "Struggling";
    }
}
