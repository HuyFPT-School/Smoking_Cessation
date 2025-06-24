package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.PlanRepo;
import com.example.demo.entity.Plan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class UserProgressDistributionService {

    @Autowired
    private PlanRepo planRepo;

    public ProgressDistribution getProgressDistribution() {
        List<Plan> plans = planRepo.findAll();

        int total = 0;
        int firstWeek = 0;
        int firstMonth = 0;
        int threeMonthsOrMore = 0;

        LocalDate today = LocalDate.now();

        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();
            if (quitDate == null) continue;

            long days = ChronoUnit.DAYS.between(quitDate, today);
            if (days < 0) continue;

            total++;

            if (days <= 7) {
                firstWeek++;
            } else if (days <= 30) {
                firstMonth++;
            } else if (days >= 90) {
                threeMonthsOrMore++;
            }
        }

        // Tính phần trăm
        double weekPercent = total == 0 ? 0 : Math.round((double) firstWeek / total * 1000) / 10.0;
        double monthPercent = total == 0 ? 0 : Math.round((double) firstMonth / total * 1000) / 10.0;
        double threeMonthPercent = total == 0 ? 0 : Math.round((double) threeMonthsOrMore / total * 1000) / 10.0;

        return new ProgressDistribution(weekPercent, monthPercent, threeMonthPercent);
    }

    // Inner class để trả về 3 kết quả
    public record ProgressDistribution(
            double firstWeekPercent,
            double firstMonthPercent,
            double threeMonthsOrMorePercent
    ) {}
}
