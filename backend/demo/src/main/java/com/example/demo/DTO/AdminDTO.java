package com.example.demo.DTO;

import lombok.Data;

@Data
public class AdminDTO {
    private long totalUsers;
    private double growthRate;
    private double successRate;
    private long newUsersThisMonth;
    private double overallSmokeFreeRate;
    private double lastMonthSmokeFreeRate;
    private double averageDailyUsers;
    private double firstWeekPercent;
    private double firstMonthPercent;
    private double threeMonthsOrMorePercent;

}

