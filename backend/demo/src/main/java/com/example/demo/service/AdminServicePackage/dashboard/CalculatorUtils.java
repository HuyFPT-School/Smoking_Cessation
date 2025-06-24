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

    // Tổng số ngày không hút từ quitDate đến nay
    public long calculateDaysSmokeFree(Plan plan) {
        LocalDate quitDate = plan.getQuitDate();
        if (quitDate == null) return 0;

        LocalDate today = LocalDate.now();
        Integer userId = tryParseUserId(plan.getUserId());
        if (userId == null) return 0;

        long totalDays = ChronoUnit.DAYS.between(quitDate, today);
        if (totalDays <= 0) return 0;

        List<Tracking> trackings = trackingRepo.findByUserId(userId);
        long smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> parseDateSafe(t.getDate()))
                .filter(date -> date != null && !date.isBefore(quitDate) && !date.isAfter(today))
                .distinct()
                .count();

        return totalDays - smokingDays;
    }

    // Tính số ngày không hút trong khoảng start đến end
    public long calculateSmokeFreeDaysInRange(Plan plan, LocalDate start, LocalDate end) {
        if (plan.getQuitDate() == null || plan.getQuitDate().isAfter(end)) return 0;
        Integer userId = tryParseUserId(plan.getUserId());
        if (userId == null) return 0;

        // Giới hạn start từ quitDate trở đi
        LocalDate rangeStart = plan.getQuitDate().isAfter(start) ? plan.getQuitDate() : start;

        long totalRangeDays = ChronoUnit.DAYS.between(rangeStart, end.plusDays(1));
        if (totalRangeDays <= 0) return 0;

        List<Tracking> trackings = trackingRepo.findByUserId(userId);
        long smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> parseDateSafe(t.getDate()))
                .filter(date -> date != null && !date.isBefore(rangeStart) && !date.isAfter(end))
                .distinct()
                .count();

        return totalRangeDays - smokingDays;
    }

    // Tính tổng số ngày từ quitDate đến end, bị giới hạn bởi start
    public long calculateTotalDaysInRange(LocalDate quitDate, LocalDate start, LocalDate end) {
        if (quitDate == null || quitDate.isAfter(end)) return 0;
        LocalDate actualStart = quitDate.isAfter(start) ? quitDate : start;
        return ChronoUnit.DAYS.between(actualStart, end.plusDays(1));
    }

    // Tiện ích: tính số ngày milestone yêu cầu
    public long getDaysFromMilestone(String milestone) {
        if (milestone == null) return 0;
        try {
            String[] parts = milestone.toLowerCase().split(" ");
            int num = Integer.parseInt(parts[0]);
            return switch (parts[1]) {
                case "day", "days" -> num;
                case "week", "weeks" -> num * 7L;
                case "month", "months" -> num * 30L;
                case "year", "years" -> num * 365L;
                default -> 0;
            };
        } catch (Exception e) {
            return 0;
        }
    }

    private LocalDate parseDateSafe(String dateStr) {
        try {
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            return null;
        }
    }

    private Integer tryParseUserId(String id) {
        try {
            return Integer.parseInt(id);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
