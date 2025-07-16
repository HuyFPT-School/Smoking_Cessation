package com.example.demo.service.UserDashboardService;

import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import org.slf4j.Logger;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrackingHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(TrackingHistoryService.class);

    // Định dạng ngày tháng kiểu ISO_LOCAL_DATE: yyyy-MM-dd
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final PlanRepo planRepo;
    private final TrackingRepo trackingRepo;

    /**
     * Lấy lịch sử theo dõi hành vi hút thuốc và cravings từ ngày quitDate đến hôm nay.
     * Trả về danh sách mỗi ngày gồm: số lần hút thuốc, số cravings, trung bình satisfaction.
     */
    public ResponseEntity<List<Map<String, Object>>> getHistory(Integer userId) {
        Optional<Plan> planOpt = planRepo.findByUserId(userId);
        if (planOpt.isEmpty()) {
            logger.warn("Plan not found for userId: {}", userId);
            return ResponseEntity.notFound().build();
        }

        Plan plan = planOpt.get();
        LocalDate quitDate = plan.getQuitDate();
        if (quitDate == null) {
            logger.error("Quit date is null for userId: {}", userId);
            return ResponseEntity.badRequest().build();
        }

        // Lấy ngày hôm nay theo múi giờ Việt Nam
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));

        // Lấy tất cả tracking từ ngày bỏ thuốc đến hôm nay
        List<Tracking> trackings = trackingRepo.findByUserIdAndDateBetween(userId, quitDate, today);

        //  Đếm số lượt hút thuốc theo ngày
        Map<LocalDate, Long> cigaretteCounts = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()), // chuyển từ String sang LocalDate
                        Collectors.counting()
                ));

        //  Tính trung bình satisfaction của cravings mỗi ngày
        Map<LocalDate, Double> averageCravingSatisfaction = trackings.stream()
                .filter(t -> !"smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null && t.getSatisfaction() >= 1 && t.getSatisfaction() <= 10)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()),
                        Collectors.averagingDouble(Tracking::getSatisfaction)
                ));

        //  Đếm số lượt cravings mỗi ngày
        Map<LocalDate, Long> cravingCounts = trackings.stream()
                .filter(t -> !"smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()),
                        Collectors.counting()
                ));

        // Tạo danh sách lịch sử theo từng ngày, từ ngày bỏ thuốc đến hôm nay
        List<Map<String, Object>> history = new ArrayList<>();
        long daysBetween = java.time.temporal.ChronoUnit.DAYS.between(quitDate, today);

        for (long i = 0; i <= daysBetween; i++) {
            LocalDate date = quitDate.plusDays(i);
            Map<String, Object> dailyEntry = new HashMap<>();
            dailyEntry.put("date", date.format(DATE_FORMATTER)); // format về yyyy-MM-dd
            dailyEntry.put("cigarettes", cigaretteCounts.getOrDefault(date, 0L).intValue()); // số lần hút thuốc
            dailyEntry.put("cravingCount", cravingCounts.getOrDefault(date, 0L).intValue()); // số cravings
            dailyEntry.put("averageCravingSatisfaction", averageCravingSatisfaction.getOrDefault(date, 0.0)); // mức độ satisfaction trung bình
            history.add(dailyEntry);
        }

        return ResponseEntity.ok(history);
    }

    /**
     * Chuyển chuỗi ngày dạng yyyy-MM-dd về LocalDate.
     * Nếu lỗi format thì trả về ngày hiện tại.
     */
    private LocalDate parseTrackingDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: {}", dateStr);
            return LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        }
    }
}
