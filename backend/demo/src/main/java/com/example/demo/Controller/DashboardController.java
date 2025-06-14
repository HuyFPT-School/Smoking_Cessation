package com.example.demo.Controller;

import com.example.demo.DTO.DashboardDTO;
import com.example.demo.entity.Dashboard;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.Repo.DashboardRepo;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.utils.DataUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;

    private final DashboardRepo dashboardRepo;
    private final PlanRepo planRepo;
    private final TrackingRepo trackingRepo;
    private final UserRepo userRepo;

    @Autowired
    private final SimpMessagingTemplate messagingTemplate;

    public record MilestoneResult(String nextMilestone, long remainingDaysToMilestone) {}
    public record BasicMetrics(long totalDays, long daysSmokeFree, double moneySaved, Integer cigarettesAvoided) {}
    public record TimeBasedMetrics(
            Integer todayCigarettes, Integer todayCravings,
            Integer yesterdayCigarettes, Integer yesterdayCravings,
            Integer last7DaysCigarettes, Integer last7DaysCravings,
            double resistanceRate
    ) {}

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Integer userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            logger.warn("User not found for userId: {}", userId);
            return ResponseEntity.notFound().build();
        }

        Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(userId));
        if (planOpt.isEmpty()) {
            logger.warn("Plan not found for userId: {}", userId);
            return ResponseEntity.notFound().build();
        }

        Plan plan = planOpt.get();
        LocalDate quitDate = plan.getQuitDate();
        int cigarettesPerDay = plan.getCigarettesPerDay();

        if (quitDate == null) {
            logger.error("Quit date is null for userId: {}", userId);
            return ResponseEntity.badRequest().body(
                    DashboardDTO.builder()
                            .userId(userId)
                            .nextMilestone("No quit date set")
                            .remainingDaysToMilestone(0)
                            .cigarettesPerDay(cigarettesPerDay)
                            .quitDate(null)
                            .topTriggers(Collections.emptyList())
                            .build()
            );
        }

        LocalDate today = LocalDate.now();
        Optional<Dashboard> existingDashboard = dashboardRepo.findByUserIdAndRecordedDate(userId, today);
        List<Tracking> trackings = trackingRepo.findByUserId(userId);

        if (existingDashboard.isPresent()) {
            Dashboard dashboard = existingDashboard.get();
            logger.debug("Returning existing dashboard for userId {} on {}", userId, today);
            return ResponseEntity.ok(createDashboardDTOFromDashboard(dashboard, plan, trackings, quitDate, cigarettesPerDay, userId));
        }

        DashboardDTO dto = updateDashboard(userId, plan, trackings, quitDate, cigarettesPerDay);
        return ResponseEntity.ok(dto);
    }

    // New endpoint to get daily cigarette counts from quitDate to today
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTrackingHistory(@PathVariable Integer userId) {
        // Tìm plan của user
        Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(userId));
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

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        List<Tracking> trackings = trackingRepo.findByUserIdAndDateBetween(userId, quitDate, today);

        // Group trackings by date and count cigarettes
        Map<LocalDate, Long> cigaretteCounts = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()),
                        Collectors.counting()
                ));

        // Group cravings by date to calculate average satisfaction and count
        Map<LocalDate, Double> averageCravingSatisfaction = trackings.stream()
                .filter(t -> !"smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null && t.getSatisfaction() >= 1 && t.getSatisfaction() <= 10)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()),
                        Collectors.averagingDouble(Tracking::getSatisfaction)
                ));

        Map<LocalDate, Long> cravingCounts = trackings.stream()
                .filter(t -> !"smoking".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null)
                .collect(Collectors.groupingBy(
                        t -> parseTrackingDate(t.getDate()),
                        Collectors.counting()
                ));

        // Create list of daily counts from quitDate to today
        List<Map<String, Object>> history = new ArrayList<>();
        long daysBetween = ChronoUnit.DAYS.between(quitDate, today) + 1;
        for (long i = 0; i < daysBetween; i++) {
            LocalDate date = quitDate.plusDays(i);
            Map<String, Object> dailyEntry = new HashMap<>();
            dailyEntry.put("date", date.format(DATE_FORMATTER));
            dailyEntry.put("cigarettes", cigaretteCounts.getOrDefault(date, 0L).intValue());
            dailyEntry.put("cravingCount", cravingCounts.getOrDefault(date, 0L).intValue());
            dailyEntry.put("averageCravingSatisfaction", averageCravingSatisfaction.getOrDefault(date, 0.0));
            history.add(dailyEntry);
        }

        return ResponseEntity.ok(history);
    }

    private LocalDate parseTrackingDate(String dateStr) {
        try {
            return LocalDate.parse(dateStr, DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            logger.error("Invalid date format: {}", dateStr);
            return LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")); // Hoặc xử lý lỗi khác tùy yêu cầu
        }
    }

    @EventListener
    @Async
    @Transactional
    public void handleDataUpdatedEvent(DataUpdatedEvent event) {
        try {
            Integer userId = event.getUserId();
            Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(userId));
            if (planOpt.isEmpty()) {
                logger.warn("Plan not found for userId: {}", userId);
                return;
            }

            Plan plan = planOpt.get();
            LocalDate quitDate = plan.getQuitDate();
            int cigarettesPerDay = plan.getCigarettesPerDay();

            if (quitDate == null) {
                logger.error("Quit date is null for userId: {}", userId);
                return;
            }

            List<Tracking> trackings = trackingRepo.findByUserId(userId);
            updateDashboard(userId, plan, trackings, quitDate, cigarettesPerDay);
        } catch (Exception e) {
            logger.error("Error handling data updated event for userId: {}", event.getUserId(), e);
        }
    }

    private DashboardDTO updateDashboard(Integer userId, Plan plan, List<Tracking> trackings,
                                         LocalDate quitDate, int cigarettesPerDay) {
        LocalDate today = LocalDate.now();
        BasicMetrics basicMetrics = calculateBasicMetrics(userId, quitDate, trackings, cigarettesPerDay);
        MilestoneResult milestoneResult = calculateNextMilestone(plan, basicMetrics.daysSmokeFree());
        TimeBasedMetrics timeMetrics = calculateTimeBasedMetrics(trackings);
        List<String> topTriggers = trackingRepo.findTop3Triggers(userId);

        dashboardRepo.findByUserIdAndRecordedDate(userId, today)
                .ifPresent(dashboardRepo::delete);

        Dashboard dashboard = createAndSaveDashboard(userId, basicMetrics, milestoneResult, timeMetrics);

        DashboardDTO dto = createDashboardDTO(userId, basicMetrics, milestoneResult, timeMetrics,
                quitDate, topTriggers, cigarettesPerDay);
        messagingTemplate.convertAndSend("/topic/dashboard/" + userId, dto);
        logger.info("Dashboard updated and pushed to frontend for userId: {}", userId);

        return dto;
    }

    private DashboardDTO createDashboardDTOFromDashboard(Dashboard dashboard, Plan plan, List<Tracking> trackings,
                                                         LocalDate quitDate, int cigarettesPerDay, Integer userId) {
        List<String> topTriggers = trackingRepo.findTop3Triggers(userId);
        return DashboardDTO.builder()
                .userId(dashboard.getUserId())
                .daysSmokeFree(dashboard.getDaysSmokeFree())
                .moneySaved(dashboard.getMoneySaved())
                .cigarettesAvoided(dashboard.getCigarettesAvoided())
                .nextMilestone(dashboard.getNextMilestone())
                .remainingDaysToMilestone(calculateNextMilestone(plan, dashboard.getDaysSmokeFree()).remainingDaysToMilestone())
                .todayCigarettes(dashboard.getTodayCigarettes())
                .todayCravings(dashboard.getTodayCravings())
                .yesterdayCigarettes(dashboard.getYesterdayCigarettes())
                .yesterdayCravings(dashboard.getYesterdayCravings())
                .last7DaysCigarettes(dashboard.getLast7DaysCigarettes())
                .last7DaysCravings(dashboard.getLast7DaysCravings())
                .resistanceRate(dashboard.getResistanceRate())
                .quitDate(quitDate)
                .topTriggers(topTriggers)
                .cigarettesPerDay(cigarettesPerDay)
                .build();
    }

    private BasicMetrics calculateBasicMetrics(Integer userId, LocalDate quitDate, List<Tracking> trackings, int cigarettesPerDay) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        long totalDays = ChronoUnit.DAYS.between(quitDate, today) + 1;

        Set<LocalDate> smokingDays = trackings.stream()
                .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                .map(t -> LocalDate.parse(t.getDate()))
                .collect(Collectors.toSet());
        long daysSmokeFree = totalDays - smokingDays.size();

        double moneySaved = 0.0;
        int cigarettesAvoided = 0;

        Optional<Dashboard> yesterdayDashboard = dashboardRepo.findByUserIdAndRecordedDate(userId, yesterday);
        if (yesterdayDashboard.isPresent()) {
            moneySaved = yesterdayDashboard.get().getMoneySaved();
            cigarettesAvoided = yesterdayDashboard.get().getCigarettesAvoided();

            long todayCigarettesSmoked = trackings.stream()
                    .filter(t -> "smoking".equalsIgnoreCase(t.getType()))
                    .map(t -> LocalDate.parse(t.getDate()))
                    .filter(date -> date.equals(today))
                    .count();

            int todayCigarettesAvoided = cigarettesPerDay - (int) todayCigarettesSmoked;
            if (todayCigarettesAvoided < 0) todayCigarettesAvoided = 0;

            cigarettesAvoided += todayCigarettesAvoided;
            moneySaved += todayCigarettesAvoided * 1000.0 / 25000;
            moneySaved = Math.round(moneySaved * 100.0) / 100.0;
        } else {
            long totalExpectedCigarettes = totalDays * cigarettesPerDay;
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

    private MilestoneResult calculateNextMilestone(Plan plan, long daysSmokeFree) {
        String nextMilestone = "No rewards defined";
        long remainingDaysToMilestone = 0;

        if (plan.getRewards() == null || plan.getRewards().isEmpty()) {
            return new MilestoneResult(nextMilestone, remainingDaysToMilestone);
        }

        final long[] remainingDaysHolder = {0};
        nextMilestone = plan.getRewards().stream()
                .map(reward -> {
                    try {
                        if (reward.getMilestone() == null) return null;
                        String[] parts = reward.getMilestone().toLowerCase().split(" ");
                        if (parts.length < 2) return null;

                        int num = Integer.parseInt(parts[0]);
                        String unit = parts[1];
                        long calculatedDays;
                        String shortMilestone;

                        if (unit.startsWith("day")) {
                            calculatedDays = num;
                            shortMilestone = num == 1 ? "1 day" : num + " days";
                        } else if (unit.startsWith("week")) {
                            calculatedDays = (long) num * 7;
                            shortMilestone = num == 1 ? "1 week" : num + " weeks";
                        } else if (unit.startsWith("month")) {
                            calculatedDays = (long) num * 30;
                            shortMilestone = num == 1 ? "1 month" : num + " months";
                        } else if (unit.startsWith("year")) {
                            calculatedDays = (long) num * 365;
                            shortMilestone = num == 1 ? "1 year" : num + " years";
                        } else {
                            return null;
                        }

                        return new Object() {
                            final String milestone = shortMilestone;
                            final long milestoneDays = calculatedDays;
                        };
                    } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                        logger.warn("Malformed milestone: {}", reward.getMilestone());
                        return null;
                    }
                })
                .filter(obj -> obj != null && obj.milestoneDays > daysSmokeFree)
                .min((a, b) -> Long.compare(a.milestoneDays, b.milestoneDays))
                .map(obj -> {
                    remainingDaysHolder[0] = obj.milestoneDays - daysSmokeFree;
                    return obj.milestone;
                })
                .orElse("All rewards achieved");

        remainingDaysToMilestone = remainingDaysHolder[0];
        return new MilestoneResult(nextMilestone, remainingDaysToMilestone);
    }

    private TimeBasedMetrics calculateTimeBasedMetrics(List<Tracking> trackings) {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekAgo = today.minusDays(6);

        int todayCigs = 0, todayCravings = 0;
        int yCigs = 0, yCravings = 0;
        int last7Cigs = 0, last7Cravings = 0;

        for (Tracking t : trackings) {
            LocalDate trackDate = LocalDate.parse(t.getDate());
            boolean isCraving = !"smoking".equalsIgnoreCase(t.getType());

            if (trackDate.equals(today)) {
                if (isCraving) todayCravings++;
                else todayCigs++;
            } else if (trackDate.equals(yesterday)) {
                if (isCraving) yCravings++;
                else yCigs++;
            }

            if (!trackDate.isBefore(weekAgo) && !trackDate.isAfter(today)) {
                if (isCraving) last7Cravings++;
                else last7Cigs++;
            }
        }

        double rawRate = (last7Cravings + last7Cigs == 0) ? 0 :
                (last7Cravings * 100.0) / (last7Cravings + last7Cigs);
        double resistanceRate = Math.round(rawRate * 100.0) / 100.0;

        return new TimeBasedMetrics(todayCigs, todayCravings, yCigs, yCravings,
                last7Cigs, last7Cravings, resistanceRate);
    }

    private Dashboard createAndSaveDashboard(Integer userId, BasicMetrics basicMetrics,
                                             MilestoneResult milestoneResult,
                                             TimeBasedMetrics timeMetrics) {
        Dashboard dashboard = new Dashboard();
        dashboard.setUserId(userId);
        dashboard.setDaysSmokeFree((int) basicMetrics.daysSmokeFree());
        dashboard.setMoneySaved(basicMetrics.moneySaved());
        dashboard.setCigarettesAvoided(basicMetrics.cigarettesAvoided());
        dashboard.setNextMilestone(milestoneResult.nextMilestone());
        dashboard.setTodayCigarettes(timeMetrics.todayCigarettes());
        dashboard.setTodayCravings(timeMetrics.todayCravings());
        dashboard.setYesterdayCigarettes(timeMetrics.yesterdayCigarettes());
        dashboard.setYesterdayCravings(timeMetrics.yesterdayCravings());
        dashboard.setLast7DaysCigarettes(timeMetrics.last7DaysCigarettes());
        dashboard.setLast7DaysCravings(timeMetrics.last7DaysCravings());
        dashboard.setResistanceRate(timeMetrics.resistanceRate());
        dashboard.setRecordedDate(LocalDate.now());
        dashboard.setCreatedAt(LocalDateTime.now());

        dashboardRepo.save(dashboard);
        logger.debug("Saved new dashboard for userId {} on {}", userId, LocalDate.now());
        return dashboard;
    }

    private DashboardDTO createDashboardDTO(Integer userId, BasicMetrics basicMetrics,
                                            MilestoneResult milestoneResult,
                                            TimeBasedMetrics timeMetrics,
                                            LocalDate quitDate, List<String> topTriggers,
                                            Integer cigarettesPerDay) {
        return DashboardDTO.builder()
                .userId(userId)
                .daysSmokeFree((int) basicMetrics.daysSmokeFree())
                .moneySaved(basicMetrics.moneySaved())
                .cigarettesAvoided(basicMetrics.cigarettesAvoided())
                .nextMilestone(milestoneResult.nextMilestone())
                .remainingDaysToMilestone(milestoneResult.remainingDaysToMilestone())
                .todayCigarettes(timeMetrics.todayCigarettes())
                .todayCravings(timeMetrics.todayCravings())
                .yesterdayCigarettes(timeMetrics.yesterdayCigarettes())
                .yesterdayCravings(timeMetrics.yesterdayCravings())
                .last7DaysCigarettes(timeMetrics.last7DaysCigarettes())
                .last7DaysCravings(timeMetrics.last7DaysCravings())
                .resistanceRate(timeMetrics.resistanceRate())
                .quitDate(quitDate)
                .topTriggers(topTriggers)
                .cigarettesPerDay(cigarettesPerDay)
                .build();
    }
}