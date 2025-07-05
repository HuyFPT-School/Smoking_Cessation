package com.example.demo.service.UserDashboardService;

import com.example.demo.Repo.TrackingRepo;
import com.example.demo.service.UserDashboardService.model.BasicMetrics;
import com.example.demo.service.UserDashboardService.model.MilestoneResult;
import com.example.demo.service.UserDashboardService.model.TimeBasedMetrics;
import com.example.demo.DTO.DashboardDTO;
import com.example.demo.Repo.DashboardRepo;
import com.example.demo.entity.Dashboard;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardMetricsService {

    private final DashboardRepo dashboardRepo;
    private final TrackingRepo trackingRepo;


    /**
     * Tạo DTO từ dashboard đã có sẵn trong database
     * Không tính toán lại toàn bộ mà chỉ thêm remainingDaysToMilestone để cập nhật chính xác.
     */
    public DashboardDTO createDTOFromExisting(Dashboard dashboard, Plan plan, Integer userId) {

        //Lọc ra top 3 trigger đứng đầu (sử dụng method trong Repo)
        List<String> topTriggers = trackingRepo.findTop3Triggers(userId);

        //gọi method calculate để tính và trả về RemainingDaysToMilestone
        var milestone = new MilestoneService().calculate(plan, dashboard.getDaysSmokeFree());

        return DashboardDTO.builder()
                .userId(dashboard.getUserId())
                .daysSmokeFree(dashboard.getDaysSmokeFree())
                .moneySaved(dashboard.getMoneySaved())
                .cigarettesAvoided(dashboard.getCigarettesAvoided())
                .nextMilestone(dashboard.getNextMilestone())

                 //Duy nhất phải tính thêm remainingDaysToMilestone nếu muốn chính xác theo thời điểm hiện tại.(số ngày ko hút còn lại để đạt được reward)
                .remainingDaysToMilestone(milestone.getRemainingDaysToMilestone())

                .todayCigarettes(dashboard.getTodayCigarettes())
                .todayCravings(dashboard.getTodayCravings())
                .yesterdayCigarettes(dashboard.getYesterdayCigarettes())
                .yesterdayCravings(dashboard.getYesterdayCravings())
                .last7DaysCigarettes(dashboard.getLast7DaysCigarettes())
                .last7DaysCravings(dashboard.getLast7DaysCravings())
                .resistanceRate(dashboard.getResistanceRate())
                .quitDate(plan.getQuitDate())
                .topTriggers(topTriggers)
                .cigarettesPerDay(plan.getCigarettesPerDay())
                .build();
    }


    /**
     * Tính toán các chỉ số cơ bản:
     * - Tổng ngày bỏ thuốc
     * - Ngày không hút thuốc
     * - Số thuốc tránh được
     * - Tiền tiết kiệm
     */
    public BasicMetrics calculateBasic(Integer userId, LocalDate quitDate, List<Tracking> trackings, int cigsPerDay) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        long totalDays = ChronoUnit.DAYS.between(quitDate, today) + 1;
        if (totalDays <= 0) {
            // Trường hợp người dùng chưa bắt đầu cai
            return new BasicMetrics(0, 0, 0.0, 0);  // Quit date ở tương lai → không tính
        }

        // Lấy các ngày có hành vi hút thuốc
        Set<LocalDate> smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> LocalDate.parse(t.getDate()))
                .collect(Collectors.toSet());

        long daysSmokeFree = Math.max(0, totalDays - smokingDays.size());

        double moneySaved = 0.0;
        int cigarettesAvoided = 0;

        Optional<Dashboard> yesterdayDashboard = dashboardRepo.findByUserIdAndRecordedDate(userId, yesterday);

        if (yesterdayDashboard.isPresent()) {
            // Nếu hôm qua đã có Dashboard, tiếp tục tính tiếp từ dữ liệu đó
            moneySaved = yesterdayDashboard.get().getMoneySaved();
            cigarettesAvoided = yesterdayDashboard.get().getCigarettesAvoided();

            long todayCigarettesSmoked = trackings.stream()
                    .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                    .map(t -> LocalDate.parse(t.getDate()))
                    .filter(date -> date.equals(today))
                    .count();

            int todayCigarettesAvoided = cigsPerDay - (int) todayCigarettesSmoked;
            if (todayCigarettesAvoided < 0) todayCigarettesAvoided = 0;

            cigarettesAvoided += todayCigarettesAvoided;
            moneySaved += todayCigarettesAvoided * 1000.0 / 25000;
            moneySaved = Math.round(moneySaved * 100.0) / 100.0;

        } else if (totalDays == 1) {
            // Trường hợp lần đầu (chưa có dashboard hôm qua)
            long todayCigarettesSmoked = trackings.stream()
                    .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                    .map(t -> LocalDate.parse(t.getDate()))
                    .filter(date -> date.equals(today))
                    .count();

            int todayCigarettesAvoided = cigsPerDay - (int) todayCigarettesSmoked;
            if (todayCigarettesAvoided < 0) todayCigarettesAvoided = 0;

            cigarettesAvoided = todayCigarettesAvoided;
            moneySaved = todayCigarettesAvoided * 1000.0 / 25000;
            moneySaved = Math.round(moneySaved * 100.0) / 100.0;

        } else {
            // Trường hợp tổng quát: tính tổng số thuốc lẽ ra sẽ hút, trừ đi số đã hút
            long totalExpectedCigarettes = totalDays * cigsPerDay;
            long totalCigarettesSmoked = trackings.stream()
                    .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                    .count();

            cigarettesAvoided = (int) (totalExpectedCigarettes - totalCigarettesSmoked);
            if (cigarettesAvoided < 0) cigarettesAvoided = 0;

            moneySaved = cigarettesAvoided * 1000.0 / 25000;
            moneySaved = Math.round(moneySaved * 100.0) / 100.0;
        }

        return new BasicMetrics(totalDays, daysSmokeFree, moneySaved, cigarettesAvoided);
    }


    /**
     * Tính toán các chỉ số theo thời gian: hôm nay, hôm qua, 7 ngày gần nhất
     */
    public TimeBasedMetrics calculateTimeBased(List<Tracking> trackings) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekAgo = today.minusDays(6);

        int todayCigs = 0, todayCravings = 0;
        int yCigs = 0, yCravings = 0;
        int last7Cigs = 0, last7Cravings = 0;

        for (Tracking t : trackings) {
            LocalDate trackDate = LocalDate.parse(t.getDate());
            boolean isCraving = !"smoking".equalsIgnoreCase(t.getType());

            // Phân loại theo ngày
            if (trackDate.equals(today)) {
                if (isCraving) todayCravings++;
                else todayCigs++;
            } else if (trackDate.equals(yesterday)) {
                if (isCraving) yCravings++;
                else yCigs++;
            }

            // Tính trong 7 ngày gần nhất
            if (!trackDate.isBefore(weekAgo) && !trackDate.isAfter(today)) {
                if (isCraving) last7Cravings++;
                else last7Cigs++;
            }
        }

        // Tỷ lệ cưỡng lại cơn thèm thuốc = cravings / (cravings + hút)
        double rawRate = (last7Cravings + last7Cigs == 0) ? 0 : (last7Cravings * 100.0) / (last7Cravings + last7Cigs);
        double resistanceRate = Math.round(rawRate * 100.0) / 100.0;

        return new TimeBasedMetrics(todayCigs, todayCravings, yCigs, yCravings,
                last7Cigs, last7Cravings, resistanceRate);
    }


    /**
     * Lưu Dashboard đã tính vào database
     */
    public Dashboard saveDashboard(Integer userId, BasicMetrics basic, MilestoneResult milestone, TimeBasedMetrics timeMetrics) {
        Dashboard dashboard = new Dashboard();
        dashboard.setUserId(userId);
        dashboard.setDaysSmokeFree((int) basic.getDaysSmokeFree());
        dashboard.setMoneySaved(basic.getMoneySaved());
        dashboard.setCigarettesAvoided(basic.getCigarettesAvoided());
        dashboard.setNextMilestone(milestone.getNextMilestone());
        dashboard.setTodayCigarettes(timeMetrics.getTodayCigarettes());
        dashboard.setTodayCravings(timeMetrics.getTodayCravings());
        dashboard.setYesterdayCigarettes(timeMetrics.getYesterdayCigarettes());
        dashboard.setYesterdayCravings(timeMetrics.getYesterdayCravings());
        dashboard.setLast7DaysCigarettes(timeMetrics.getLast7DaysCigarettes());
        dashboard.setLast7DaysCravings(timeMetrics.getLast7DaysCravings());
        dashboard.setResistanceRate(timeMetrics.getResistanceRate());
        dashboard.setRecordedDate(LocalDate.now());
        dashboard.setCreatedAt(LocalDateTime.now());
        return dashboardRepo.save(dashboard);
    }

    /**
     * Tạo DTO mới từ các metric tính toán (trường hợp chưa có sẵn trong DB)
     */
    public DashboardDTO createDashboardDTO(Integer userId, BasicMetrics basic,
                                           MilestoneResult milestone,
                                           TimeBasedMetrics timeMetrics,
                                           LocalDate quitDate, List<String> topTriggers,
                                           Integer cigarettesPerDay) {
        return DashboardDTO.builder()
                .userId(userId)
                .daysSmokeFree((int) basic.getDaysSmokeFree())
                .moneySaved(basic.getMoneySaved())
                .cigarettesAvoided(basic.getCigarettesAvoided())
                .nextMilestone(milestone.getNextMilestone())
                .remainingDaysToMilestone(milestone.getRemainingDaysToMilestone())
                .todayCigarettes(timeMetrics.getTodayCigarettes())
                .todayCravings(timeMetrics.getTodayCravings())
                .yesterdayCigarettes(timeMetrics.getYesterdayCigarettes())
                .yesterdayCravings(timeMetrics.getYesterdayCravings())
                .last7DaysCigarettes(timeMetrics.getLast7DaysCigarettes())
                .last7DaysCravings(timeMetrics.getLast7DaysCravings())
                .resistanceRate(timeMetrics.getResistanceRate())
                .quitDate(quitDate)
                .topTriggers(topTriggers)
                .cigarettesPerDay(cigarettesPerDay)
                .build();
    }

}
