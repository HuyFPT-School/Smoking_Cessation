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

    /**
     * ✅ Tính tỷ lệ % người dùng đã hoàn thành toàn bộ các mốc phần thưởng (milestone) trong kế hoạch bỏ thuốc
     * 📌 Thành công được định nghĩa là: số ngày không hút ≥ milestone cao nhất trong RewardItem của Plan
     * 📤 Kết quả trả về là phần trăm, làm tròn đến 1 chữ số thập phân
     */
    public double calculateSuccessRate() {

        // Lấy toàn bộ kế hoạch bỏ thuốc
        List<Plan> plans = planRepo.findAll();

        int usersWithRewards = 0;
        int usersCompletedAll = 0;

        // Duyệt qua từng kế hoạch
        for (Plan plan : plans) {
            List<RewardItem> rewards = plan.getRewards();

            // Nếu không có reward thì bỏ qua (không tính vào mẫu khảo sát)
            if (rewards == null || rewards.isEmpty()) continue;

            usersWithRewards++;

            // ✅ Tìm mốc thời gian dài nhất trong phần thưởng (ví dụ: "3 months" → 90 ngày)
            long maxRequiredDays = rewards.stream()
                    .mapToLong(r -> calculatorUtils.getDaysFromMilestone(r.getMilestone()))
                    .max().orElse(0);  // Nếu không có thì mặc định là 0

            // ✅ Tính số ngày người dùng đã không hút thuốc thực tế
            long actualDays = calculatorUtils.calculateDaysSmokeFree(plan);
            if (actualDays >= maxRequiredDays) {
                usersCompletedAll++;
            }
        }
        return usersWithRewards == 0
                ? 0
                : Math.round((double) usersCompletedAll / usersWithRewards * 1000) / 10.0;
    }


    /**
     * ✅ Tính tỉ lệ % số ngày không hút thuốc tổng thể của toàn bộ người dùng
     * 📌 Công thức: (Tổng số ngày không hút thuốc) / (Tổng số ngày kể từ ngày bắt đầu plan) * 100
     * 📤 Trả về số phần trăm, làm tròn đến 1 chữ số thập phân
     */
    public double calculateOverallSmokeFreeRate() {

        // Lấy tất cả các kế hoạch bỏ thuốc của người dùng
        List<Plan> plans = planRepo.findAll();

        long totalSmokeFreeDays = 0;
        long totalPlanDays = 0;

        // Duyệt từng plan
        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();

            // Bỏ qua nếu kế hoạch không có ngày bỏ thuốc, hoặc bỏ thuốc ở tương lai
            if (quitDate == null || quitDate.isAfter(LocalDate.now())) continue;

            // ✅ Cộng số ngày không hút thuốc (dựa vào tracking của user)
            totalSmokeFreeDays += calculatorUtils.calculateDaysSmokeFree(plan);

            // ✅ Cộng số ngày từ ngày bỏ thuốc đến hôm nay (tổng thời gian user có cơ hội để bỏ thuốc)
            totalPlanDays += calculatorUtils.calculateTotalDaysInRange(
                    quitDate,
                    quitDate,
                    LocalDate.now()
            );
        }
        return totalPlanDays == 0
                ? 0  // Tránh chia 0 nếu không có dữ liệu nào hợp lệ
                : Math.round((double) totalSmokeFreeDays / totalPlanDays * 1000) / 10.0;
    }


    /**
     * ✅ Tính phần trăm số ngày người dùng không hút thuốc trong tháng trước
     * 📌 Cách tính: (Tổng số ngày không hút thuốc trong tháng trước) / (Tổng số ngày kể từ quitDate đến hôm nay của tất cả kế hoạch) * 100
     * 📤 Kết quả làm tròn đến 1 chữ số thập phân (%)
     */
    public double calculateLastMonthSmokeFreeRate() {

        // Lấy toàn bộ kế hoạch bỏ thuốc của người dùng
        List<Plan> plans = planRepo.findAll();

        long totalSmokeFreeDaysLastMonth = 0;
        long totalAllPlanDays = 0;

        // Xác định khoảng thời gian tháng trước
        LocalDate today = LocalDate.now();
        LocalDate startOfLastMonth = today.minusMonths(1).withDayOfMonth(1);  // Ngày đầu của tháng trước
        LocalDate endOfLastMonth = startOfLastMonth.with(TemporalAdjusters.lastDayOfMonth()); // Ngày cuối của tháng trước

        // Duyệt từng kế hoạch bỏ thuốc
        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();

            // Nếu chưa có ngày quit hoặc ngày quit ở tương lai thì bỏ qua
            if (quitDate == null || quitDate.isAfter(today)) continue;

            // ✅ Tính tổng số ngày không hút thuốc trong khoảng tháng trước (tùy theo tracking của từng user)
            totalSmokeFreeDaysLastMonth += calculatorUtils.calculateSmokeFreeDaysInRange(
                    plan,
                    startOfLastMonth,
                    endOfLastMonth
            );

            // ✅ Tính tổng số ngày từ ngày bỏ thuốc đến hôm nay
            totalAllPlanDays += calculatorUtils.calculateTotalDaysInRange(
                    quitDate,
                    quitDate,
                    today
            );
        }
        return totalAllPlanDays == 0
                ? 0
                : Math.round((double) totalSmokeFreeDaysLastMonth / totalAllPlanDays * 1000) / 10.0;
    }


    /**
     * ✅ Tính số ngày cai thuốc trung bình của những người dùng đã hoàn thành toàn bộ các mốc phần thưởng (milestone)
     * 📌 Chỉ tính cho những người mà số ngày không hút thuốc ≥ milestone cao nhất trong kế hoạch (Plan)
     * 🔢 Trả về số ngày trung bình (đã làm tròn 1 chữ số thập phân)
     */
    public double calculateAvgDaysQuitPerSuccessfulUser() {

        // Lấy toàn bộ kế hoạch bỏ thuốc (mỗi user có thể có 1 Plan riêng)
        List<Plan> plans = planRepo.findAll();

        int usersCompletedAll = 0;
        long totalSmokeFreeDays = 0;

        // Duyệt qua từng Plan để kiểm tra tiến độ của người dùng
        for (Plan plan : plans) {
            List<RewardItem> rewards = plan.getRewards();

            // Bỏ qua nếu kế hoạch không có mốc phần thưởng
            if (rewards == null || rewards.isEmpty()) continue;

            // ✅ Tìm milestone cao nhất mà user cần đạt trong kế hoạch này
            long maxRequiredDays = rewards.stream()
                    .mapToLong(r -> calculatorUtils.getDaysFromMilestone(r.getMilestone()))  // Chuyển milestone (string) thành số ngày
                    .max().orElse(0);

            // ✅ Tính số ngày thực tế mà user đã không hút thuốc
            long daysSmokeFree = calculatorUtils.calculateDaysSmokeFree(plan);

            // Nếu user đã vượt qua mốc cao nhất → tính vào nhóm "thành công"
            if (daysSmokeFree >= maxRequiredDays) {
                usersCompletedAll++;
                totalSmokeFreeDays += daysSmokeFree;
            }
        }
        return usersCompletedAll == 0 ? 0 : Math.round((double) totalSmokeFreeDays / usersCompletedAll * 10) / 10.0;
    }


}
