package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.PlanRepo;
import com.example.demo.entity.Plan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

// ✅ Service dùng để tính phân bố tiến trình cai thuốc của người dùng (theo mốc thời gian)
@Service
public class UserProgressDistributionService {

    // Inject repository để lấy danh sách kế hoạch của người dùng
    @Autowired
    private PlanRepo planRepo;

    /**
     * ✅ Trả về phần trăm người dùng đạt từng mốc tiến trình:
     * - Trong tuần đầu
     * - Trong tháng đầu
     * - Cai được từ 3 tháng trở lên
     */
    public ProgressDistribution getProgressDistribution() {
        List<Plan> plans = planRepo.findAll(); // Lấy toàn bộ plan (kế hoạch bỏ thuốc)

        int total = 0;               // Tổng số người có quitDate hợp lệ
        int firstWeek = 0;           // Người mới bỏ thuốc trong 7 ngày đầu
        int firstMonth = 0;          // Người cai thuốc được hơn 1 tuần nhưng chưa quá 1 tháng
        int threeMonthsOrMore = 0;   // Người bỏ thuốc từ 3 tháng trở lên

        LocalDate today = LocalDate.now(); // Ngày hiện tại

        // Duyệt qua tất cả các plan để tính số ngày đã cai của từng người
        for (Plan plan : plans) {
            LocalDate quitDate = plan.getQuitDate();

            // Nếu không có ngày bỏ thuốc → bỏ qua
            if (quitDate == null) continue;

            long days = ChronoUnit.DAYS.between(quitDate, today); // Số ngày từ khi bỏ thuốc đến nay

            // Nếu quitDate ở tương lai → bỏ qua
            if (days < 0) continue;

            total++; // User hợp lệ

            // ✅ Phân loại theo mốc thời gian
            if (days <= 7) {
                firstWeek++; // Trong tuần đầu
            } else if (days <= 30) {
                firstMonth++; // Trong tháng đầu (nhưng quá 7 ngày)
            } else if (days >= 90) {
                threeMonthsOrMore++; // Trên 3 tháng
            }
        }

        // ✅ Tính phần trăm cho từng nhóm, làm tròn 1 chữ số thập phân
        double weekPercent = total == 0 ? 0 : Math.round((double) firstWeek / total * 1000) / 10.0;
        double monthPercent = total == 0 ? 0 : Math.round((double) firstMonth / total * 1000) / 10.0;
        double threeMonthPercent = total == 0 ? 0 : Math.round((double) threeMonthsOrMore / total * 1000) / 10.0;

        // ✅ Trả về đối tượng chứa 3 kết quả phần trăm
        return new ProgressDistribution(weekPercent, monthPercent, threeMonthPercent);
    }

    /**
     * ✅ Inner class dạng record để gom kết quả phân bố thành một object
     * 📦 Dùng làm DTO trả về cho Dashboard
     */
    public record ProgressDistribution(
            double firstWeekPercent,
            double firstMonthPercent,
            double threeMonthsOrMorePercent
    ) {}
}
