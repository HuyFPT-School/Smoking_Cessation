package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.DTO.AdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class AdminDashboardService {

    // ===================== INJECTION =====================

    @Autowired private UserGrowthService userGrowthService;
    @Autowired private SuccessRateService successRateService;
    @Autowired private UserProgressDistributionService userProgressDistributionService;  

    // ===================== MAIN METHOD =====================

    /**
     *  Tính toán và tổng hợp dữ liệu cho dashboard admin
     *  Gồm: số user, growth rate, tỉ lệ thành công, phân bố tiến trình, v.v...
     */
    public AdminDTO getTotalUserStats() {
        AdminDTO dto = new AdminDTO();  // Đối tượng DTO chứa dữ liệu trả về cho dashboard

        // Tổng số người dùng
        dto.setTotalUsers(userGrowthService.countTotalUsers());

        // Tính tốc độ tăng trưởng (growth rate %)
        double growth = userGrowthService.calculateGrowthRate();
        dto.setGrowthRate(Math.round(growth * 10.0) / 10.0);  // Làm tròn đến 1 chữ số thập phân

        // Tính tỉ lệ thành công (% số người bỏ thuốc thành công), được tính nếu hoàn thành hết các mốc reward đề ra
        double successRate = successRateService.calculateSuccessRate();
        dto.setSuccessRate(Math.round(successRate * 10.0) / 10.0);  // Làm tròn đến 1 chữ số thập phân

        // Số lượng user mới trong tháng hiện tại
        dto.setNewUsersThisMonth(userGrowthService.getUsersThisMonth());

        // Tỉ lệ tổng thể người đang không hút thuốc (overall)
        dto.setOverallSmokeFreeRate(successRateService.calculateOverallSmokeFreeRate());

        // Tỉ lệ người không hút thuốc trong tháng trước
        dto.setLastMonthSmokeFreeRate(successRateService.calculateLastMonthSmokeFreeRate());

        // Trung bình số ngày cai thuốc của người dùng đã bỏ thành công
        dto.setAverageDailyUsers(successRateService.calculateAvgDaysQuitPerSuccessfulUser());

        // Phân bố người dùng theo tiến trình (1 tuần, 1 tháng, 3 tháng trở lên)
        var distribution = userProgressDistributionService.getProgressDistribution();
        dto.setFirstWeekPercent(distribution.firstWeekPercent());
        dto.setFirstMonthPercent(distribution.firstMonthPercent());
        dto.setThreeMonthsOrMorePercent(distribution.threeMonthsOrMorePercent());

        return dto;
    }
}
