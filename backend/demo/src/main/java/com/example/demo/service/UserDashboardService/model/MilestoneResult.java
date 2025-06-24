package com.example.demo.service.UserDashboardService.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MilestoneResult {
    private final String nextMilestone;
    private final long remainingDaysToMilestone;
}
