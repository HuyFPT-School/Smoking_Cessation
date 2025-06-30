package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.DTO.AdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

// ✅ Service cung cấp dữ liệu thống kê tổng quan cho trang dashboard của ADMIN / SUPER_ADMIN
@Service  // Đánh dấu đây là 1 Spring Service — Spring sẽ quản lý instance này
public class AdminDashboardService {

    // ===================== INJECTION =====================

    @Autowired private UserGrowthService userGrowthService;  // Service tính toán số lượng user và tốc độ tăng trưởng
    @Autowired private SuccessRateService successRateService;  // Service tính toán tỉ lệ thành công, smoke-free...
    @Autowired private UserProgressDistributionService userProgressDistributionService;  // Phân bố tiến trình bỏ thuốc

    // ===================== MAIN METHOD =====================

    /**
     * ✅ Tính toán và tổng hợp dữ liệu cho dashboard admin
     * 📌 Gồm: số user, growth rate, tỉ lệ thành công, phân bố tiến trình, v.v...
     */
    public AdminDTO getTotalUserStats() {
        AdminDTO dto = new AdminDTO();  // Đối tượng DTO chứa dữ liệu trả về cho dashboard

        // 1️⃣ Tổng số người dùng
        dto.setTotalUsers(userGrowthService.countTotalUsers());

        // 2️⃣ Tính tốc độ tăng trưởng (growth rate %)
        double growth = userGrowthService.calculateGrowthRate();
        dto.setGrowthRate(Math.round(growth * 10.0) / 10.0);  // Làm tròn đến 1 chữ số thập phân

        // 3️⃣ Tính tỉ lệ thành công (% số người bỏ thuốc thành công), được tính nếu hoàn thành hết các mốc reward đề ra
        double successRate = successRateService.calculateSuccessRate();
        dto.setSuccessRate(Math.round(successRate * 10.0) / 10.0);  // Làm tròn đến 1 chữ số thập phân

        // 4️⃣ Số lượng user mới trong tháng hiện tại
        dto.setNewUsersThisMonth(userGrowthService.getUsersThisMonth());

        // 5️⃣ Tỉ lệ tổng thể người đang không hút thuốc (overall)
        dto.setOverallSmokeFreeRate(successRateService.calculateOverallSmokeFreeRate());

        // 6️⃣ Tỉ lệ người không hút thuốc trong tháng trước
        dto.setLastMonthSmokeFreeRate(successRateService.calculateLastMonthSmokeFreeRate());

        // 7️⃣ Trung bình số ngày cai thuốc của người dùng đã bỏ thành công
        dto.setAverageDailyUsers(successRateService.calculateAvgDaysQuitPerSuccessfulUser());

        // 8️⃣ Phân bố người dùng theo tiến trình (1 tuần, 1 tháng, 3 tháng trở lên)
        var distribution = userProgressDistributionService.getProgressDistribution();
        dto.setFirstWeekPercent(distribution.firstWeekPercent());               // % người vượt qua tuần đầu
        dto.setFirstMonthPercent(distribution.firstMonthPercent());             // % người vượt qua tháng đầu
        dto.setThreeMonthsOrMorePercent(distribution.threeMonthsOrMorePercent()); // % người bỏ được ≥ 3 tháng

        return dto;  // Trả về DTO chứa toàn bộ thống kê cho dashboard
    }
}
