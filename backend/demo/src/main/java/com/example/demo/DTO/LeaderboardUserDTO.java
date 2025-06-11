package com.example.demo.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardUserDTO {
    private Integer id;
    private Integer rank;
    private String name;
    private String avatarUrl;
    private String tier;
    private Integer totalPoints;
    private Integer weeklyPoints;
    private Integer monthlyPoints;
    private String startDate;
    private Integer totalDaysSinceQuit;
    private Integer consecutiveSmokFreeDays;
}
