package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.DTO.AdminDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminDashboardService {

    @Autowired private UserGrowthService userGrowthService;
    @Autowired private SuccessRateService successRateService;
    @Autowired private UserProgressDistributionService userProgressDistributionService;

    public AdminDTO getTotalUserStats() {
        AdminDTO dto = new AdminDTO();

        dto.setTotalUsers(userGrowthService.countTotalUsers());

        double growth = userGrowthService.calculateGrowthRate();
        dto.setGrowthRate(Math.round(growth * 10.0) / 10.0);

        double successRate = successRateService.calculateSuccessRate();
        dto.setSuccessRate(Math.round(successRate * 10.0) / 10.0);

        dto.setNewUsersThisMonth(userGrowthService.getUsersThisMonth());

        dto.setOverallSmokeFreeRate(successRateService.calculateOverallSmokeFreeRate());

        dto.setLastMonthSmokeFreeRate(successRateService.calculateLastMonthSmokeFreeRate());

        dto.setAverageDailyUsers(successRateService.calculateAvgDaysQuitPerSuccessfulUser());

        // Thêm phân bố tiến trình
        var distribution = userProgressDistributionService.getProgressDistribution();
        dto.setFirstWeekPercent(distribution.firstWeekPercent());
        dto.setFirstMonthPercent(distribution.firstMonthPercent());
        dto.setThreeMonthsOrMorePercent(distribution.threeMonthsOrMorePercent());

        return dto;
    }
}
