package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.PlanRepo;
import com.example.demo.entity.Plan;
import com.example.demo.entity.RewardItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
public class SuccessRateService {

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private CalculatorUtils calculatorUtils;

    // % người dùng đã hoàn thành toàn bộ mốc phần thưởng
    public double calculateSuccessRate() {
        List<Plan> plans = planRepo.findAll();
        int usersWithRewards = 0;
        int usersCompletedAll = 0;

        for (Plan plan : plans) {
            List<RewardItem> rewards = plan.getRewards();
            if (rewards == null || rewards.isEmpty()) continue;

            usersWithRewards++;

            long maxRequiredDays = rewards.stream()
                    .mapToLong(r -> calculatorUtils.getDaysFromMilestone(r.getMilestone()))
                    .max().orElse(0);

            long actualDays = calculatorUtils.calculateDaysSmokeFree(plan);

            if (actualDays >= maxRequiredDays) {
                usersCompletedAll++;
            }
        }

        return usersWithRewards == 0
                ? 0
                : Math.round((double) usersCompletedAll / usersWithRewards * 1000) / 10.0;

    }

    // % tổng số ngày không hút / tổng số ngày kể từ khi lập plan
    public double calculateOverallSmokeFreeRate() {
        List<Plan> plans = planRepo.findAll();
        long totalSmokeFreeDays = 0;
        long totalPlanDays = 0;

        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();
            if (quitDate == null || quitDate.isAfter(LocalDate.now())) continue;

            totalSmokeFreeDays += calculatorUtils.calculateDaysSmokeFree(plan);
            totalPlanDays += calculatorUtils.calculateTotalDaysInRange(
                    quitDate,
                    quitDate,
                    LocalDate.now()
            );
        }

        return totalPlanDays == 0
                ? 0
                : Math.round((double) totalSmokeFreeDays / totalPlanDays * 1000) / 10.0;


    }

    // % số ngày không hút trong tháng trước / tổng số ngày từ quitDate đến hiên tại
    public double calculateLastMonthSmokeFreeRate() {
        List<Plan> plans = planRepo.findAll();

        long totalSmokeFreeDaysLastMonth = 0;
        long totalAllPlanDays = 0;

        LocalDate today = LocalDate.now();
        LocalDate startOfLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate endOfLastMonth = startOfLastMonth.with(TemporalAdjusters.lastDayOfMonth());

        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();
            if (quitDate == null || quitDate.isAfter(today)) continue;

            // Tổng ngày không hút trong tháng trước
            totalSmokeFreeDaysLastMonth += calculatorUtils.calculateSmokeFreeDaysInRange(plan, startOfLastMonth, endOfLastMonth);

            // Tổng ngày từ quitDate đến hôm nay
            totalAllPlanDays += calculatorUtils.calculateTotalDaysInRange(quitDate, quitDate, today);
        }

        return totalAllPlanDays == 0
                ? 0
                : Math.round((double) totalSmokeFreeDaysLastMonth / totalAllPlanDays * 1000) / 10.0;
    }

    public double calculateAvgDaysQuitPerSuccessfulUser() {
        List<Plan> plans = planRepo.findAll();
        int usersCompletedAll = 0;
        long totalSmokeFreeDays = 0;

        for (Plan plan : plans) {
            List<RewardItem> rewards = plan.getRewards();
            if (rewards == null || rewards.isEmpty()) continue;

            long maxRequiredDays = rewards.stream()
                    .mapToLong(r -> calculatorUtils.getDaysFromMilestone(r.getMilestone()))
                    .max().orElse(0);

            long daysSmokeFree = calculatorUtils.calculateDaysSmokeFree(plan);
            if (daysSmokeFree >= maxRequiredDays) {
                usersCompletedAll++;
                totalSmokeFreeDays += daysSmokeFree;
            }
        }

        return usersCompletedAll == 0 ? 0 : Math.round((double) totalSmokeFreeDays / usersCompletedAll * 10) / 10.0;
    }

}
