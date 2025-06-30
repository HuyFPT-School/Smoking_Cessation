package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.TrackingRepo;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class CalculatorUtils {

    @Autowired
    private TrackingRepo trackingRepo;

    // =====================================================================================
    // ✅ 1. Tính tổng số ngày không hút thuốc kể từ ngày cai (quitDate) đến hôm nay
    //     - Trừ ra số ngày có Tracking loại "smoking"
    //     - Chỉ tính từ ngày quitDate đến LocalDate.now()
    // =====================================================================================
    public long calculateDaysSmokeFree(Plan plan) {
        LocalDate quitDate = plan.getQuitDate();
        if (quitDate == null) return 0;

        LocalDate today = LocalDate.now();
        Integer userId = tryParseUserId(plan.getUserId());
        if (userId == null) return 0;

        long totalDays = ChronoUnit.DAYS.between(quitDate, today) + 1; // +1 để tính luôn ngày hôm nay
        if (totalDays <= 0) return 0;

        // Lấy danh sách tracking theo userId
        List<Tracking> trackings = trackingRepo.findByUserId(userId);

        // Đếm số ngày có hành vi hút thuốc (tracking type = "smoking") trong khoảng [quitDate, today]
        long smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> parseDateSafe(t.getDate()))
                .filter(date -> date != null && !date.isBefore(quitDate) && !date.isAfter(today))
                .distinct() // Tránh tính trùng 1 ngày nhiều lần
                .count();

        return totalDays - smokingDays;
    }

    // =====================================================================================
    // ✅ 2. Tính số ngày không hút thuốc trong một khoảng thời gian cụ thể
    //     - Ví dụ: tháng trước, 7 ngày gần đây, v.v.
    // =====================================================================================
    public long calculateSmokeFreeDaysInRange(Plan plan, LocalDate start, LocalDate end) {
        if (plan.getQuitDate() == null || plan.getQuitDate().isAfter(end)) return 0;

        Integer userId = tryParseUserId(plan.getUserId());
        if (userId == null) return 0;

        // Start giới hạn từ quitDate trở đi
        LocalDate rangeStart = plan.getQuitDate().isAfter(start) ? plan.getQuitDate() : start;

        // Tổng số ngày trong khoảng (bao gồm cả end, nên +1)
        long totalRangeDays = ChronoUnit.DAYS.between(rangeStart, end.plusDays(1));
        if (totalRangeDays <= 0) return 0;

        List<Tracking> trackings = trackingRepo.findByUserId(userId);

        // Đếm số ngày hút thuốc trong khoảng đã chọn
        long smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> parseDateSafe(t.getDate()))
                .filter(date -> date != null && !date.isBefore(rangeStart) && !date.isAfter(end))
                .distinct()
                .count();

        return totalRangeDays - smokingDays;
    }

    // =====================================================================================
    // ✅ 3. Tính tổng số ngày từ quitDate đến end, bị giới hạn bởi start
    //     - Dùng cho thống kê tổng số ngày của plan
    // =====================================================================================
    public long calculateTotalDaysInRange(LocalDate quitDate, LocalDate start, LocalDate end) {
        if (quitDate == null || quitDate.isAfter(end)) return 0;

        // Ngày bắt đầu thực tế là lớn hơn giữa quitDate và start
        LocalDate actualStart = quitDate.isAfter(start) ? quitDate : start;

        return ChronoUnit.DAYS.between(actualStart, end.plusDays(1));
    }

    // =====================================================================================
    // ✅ 4. Chuyển milestone ("3 days", "2 weeks", ...) → số ngày
    //     - Dùng để kiểm tra đã đạt mốc thưởng chưa
    // =====================================================================================
    public long getDaysFromMilestone(String milestone) {
        if (milestone == null) return 0;
        try {
            String[] parts = milestone.toLowerCase().split(" ");
            int num = Integer.parseInt(parts[0]); // Số lượng

            // Đổi đơn vị sang ngày
            return switch (parts[1]) {
                case "day", "days" -> num;
                case "week", "weeks" -> num * 7L;
                case "month", "months" -> num * 30L;
                case "year", "years" -> num * 365L;
                default -> 0;
            };
        } catch (Exception e) {
            return 0; // milestone không hợp lệ
        }
    }

    // =====================================================================================
    // ✅ 5. Chuyển chuỗi ngày (String) sang LocalDate an toàn
    // =====================================================================================
    private LocalDate parseDateSafe(String dateStr) {
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    // =====================================================================================
    // ✅ 6. Parse userId từ String sang Integer an toàn
    // =====================================================================================
    private Integer tryParseUserId(String id) {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
