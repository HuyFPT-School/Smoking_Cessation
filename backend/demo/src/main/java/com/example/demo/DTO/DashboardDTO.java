package com.example.demo.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class DashboardDTO {
    private Integer userId;

    private int daysSmokeFree;
    private double moneySaved;
    private int cigarettesAvoided;
    private String nextMilestone;
    private long remainingDaysToMilestone;

    private int todayCigarettes;
    private int todayCravings;

    private int yesterdayCigarettes;
    private int yesterdayCravings;

    private int last7DaysCigarettes;
    private int last7DaysCravings;

    private double resistanceRate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate quitDate;

    private List<String> topTriggers;
    private int cigarettesPerDay;
}