package com.example.demo.service.UserDashboardService.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BasicMetrics {
    private final long totalDays;
    private final long daysSmokeFree;
    private final double moneySaved;
    private final int cigarettesAvoided;
}
