package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.UserRepo;
import com.example.demo.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

@Service
public class UserGrowthService {

    @Autowired
    private UserRepo userRepo;

    public long countTotalUsers() {
        return userRepo.countByRole(Role.USER);
    }

    public double calculateGrowthRate() {
        LocalDate today = LocalDate.now();

        LocalDateTime startCurrent = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endCurrent = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        LocalDate lastMonth = today.minusMonths(1);
        LocalDateTime startLast = lastMonth.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endLast = lastMonth.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        long usersThisMonth = userRepo.countByRoleAndCreateAtBetween(Role.USER, startCurrent, endCurrent);
        long usersLastMonth = userRepo.countByRoleAndCreateAtBetween(Role.USER, startLast, endLast);

        if (usersLastMonth > 0)
            return (double)(usersThisMonth - usersLastMonth) / usersLastMonth * 100;
        else
            return usersThisMonth > 0 ? 100 : 0;
    }
    public long getUsersThisMonth() {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);
        return userRepo.countByRoleAndCreateAtBetween(Role.USER, start, end);
    }
}
