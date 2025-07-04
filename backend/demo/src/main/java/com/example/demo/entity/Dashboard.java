package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard")
@Getter
@Setter
@NoArgsConstructor
public class Dashboard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "dashboard_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "days_smoke_free")
    private Integer  daysSmokeFree;

    @Column(name = "money_saved")
    private double moneySaved;

    @Column(name = "cigarettes_avoided")
    private Integer  cigarettesAvoided;

    @Column(name = "next_milestone", length = 255)
    private String nextMilestone;

    @Column(name = "today_cigarettes")
    private Integer  todayCigarettes;

    @Column(name = "today_cravings")
    private Integer  todayCravings;

    @Column(name = "yesterday_cigarettes")
    private Integer  yesterdayCigarettes;

    @Column(name = "yesterday_cravings")
    private Integer  yesterdayCravings;

    @Column(name = "last7days_cigarettes")
    private Integer  last7DaysCigarettes;

    @Column(name = "last7days_cravings")
    private Integer  last7DaysCravings;

    @Column(name = "resistance_rate")
    private double resistanceRate;

    @Column(name = "recorded_date")
    private LocalDate recordedDate;


    @Column
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
