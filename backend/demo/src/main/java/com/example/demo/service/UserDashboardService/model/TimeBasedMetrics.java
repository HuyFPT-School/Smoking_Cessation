package com.example.demo.service.UserDashboardService.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class TimeBasedMetrics {
    private int todayCigarettes;
    private int todayCravings;
    private int yesterdayCigarettes;
    private int yesterdayCravings;
    private int last7DaysCigarettes;
    private int last7DaysCravings;
    private double resistanceRate;
}
