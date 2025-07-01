package com.example.demo.service;

import com.example.demo.DTO.LeaderboardUserDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.entity.Role;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;


/**
 * Service xử lý logic nghiệp vụ cho bảng xếp hạng.
 * Tính toán điểm số, thống kê và xếp hạng người dùng.
 */
@Service
public class LeaderboardService {

    private static final int DAILY_SMOKE_FREE_POINTS = 8;
    private static final int STREAK_BONUS_POINTS = 2;
    private static final int WEEKLY_STREAK_BONUS = 40;
    private static final int MONTHLY_STREAK_BONUS = 150;
    private static final int CRAVING_RECORD_POINTS = 4;
    private static final int SMOKING_PENALTY = 15;
    private static final int WEEKLY_DAILY_POINTS = 10;
    private static final int MONTHLY_DAILY_POINTS = 10;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private TrackingRepo trackingRepo;

    /**
     * Lấy dữ liệu bảng xếp hạng theo phạm vi thời gian.
     */
    public Map<String, Object> getLeaderboardData(String timeRange, Integer currentUserId) {
        List<User> users = userRepo.findByRole(Role.USER);
        List<LeaderboardUserDTO> leaderboardUsers = calculateAllUserStats(users, timeRange);
        
        sortUsersByTimeRange(leaderboardUsers, timeRange);
        assignRanks(leaderboardUsers);
        
        LeaderboardUserDTO currentUser = findCurrentUser(leaderboardUsers, currentUserId);
        
        return createLeaderboardResponse(leaderboardUsers, currentUser, timeRange);
    }

    /**
     * Tính toán thống kê cho tất cả người dùng.
     */
    private List<LeaderboardUserDTO> calculateAllUserStats(List<User> users, String timeRange) {
        List<LeaderboardUserDTO> leaderboardUsers = new ArrayList<>();
        
        for (User user : users) {
            try {
                LeaderboardUserDTO userStats = calculateUserStats(user, timeRange);
                if (userStats != null) {
                    leaderboardUsers.add(userStats);
                }
            } catch (Exception e) {
                System.err.println("Error calculating stats for user " + user.getId() + ": " + e.getMessage());
            }
        }
        
        return leaderboardUsers;
    }

    /**
     * Tính toán thống kê cho một người dùng cụ thể.
     */
    private LeaderboardUserDTO calculateUserStats(User user, String timeRange) {
        try {
            LeaderboardUserDTO userStats = createBasicUserStats(user);
            
            LocalDate startDate = determineStartDate(user);
            String startDateString = startDate.toString();
            
            int totalDaysSinceQuit = calculateTotalDaysSinceQuit(startDate);
            List<Tracking> allTrackingEntries = getValidTrackingEntries(user, startDate);
            
            int consecutiveSmokFreeDays = calculateCurrentStreakDays(allTrackingEntries, startDate);
            
            populateUserStats(userStats, allTrackingEntries, consecutiveSmokFreeDays, 
                            startDate, startDateString, totalDaysSinceQuit, timeRange);
            
            return userStats;
        } catch (Exception e) {
            System.err.println("Error calculating user stats for user " + user.getId() + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Tạo thông tin cơ bản cho người dùng.
     */
    private LeaderboardUserDTO createBasicUserStats(User user) {
        LeaderboardUserDTO userStats = new LeaderboardUserDTO();
        userStats.setId(user.getId());
        userStats.setName(user.getName());
        userStats.setAvatarUrl(user.getAvatarUrl());
        return userStats;
    }

    /**
     * Xác định ngày bắt đầu bỏ thuốc.
     */
    private LocalDate determineStartDate(User user) {
        try {
            Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(user.getId()));
            if (planOpt.isPresent() && planOpt.get().getQuitDate() != null) {
                return planOpt.get().getQuitDate();
            }
            
            if (user.getCreateAt() != null) {
                return user.getCreateAt().toLocalDate();
            }
        } catch (Exception e) {
            System.err.println("Error determining start date for user " + user.getId() + ": " + e.getMessage());
        }
        
        return LocalDate.now();
    }

    /**
     * Tính tổng số ngày kể từ khi bắt đầu bỏ thuốc.
     */
    private int calculateTotalDaysSinceQuit(LocalDate startDate) {
        int totalDays = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
        return Math.max(totalDays, 0);
    }

    /**
     * Lấy danh sách tracking entries hợp lệ.
     */
    private List<Tracking> getValidTrackingEntries(User user, LocalDate startDate) {
        try {
            return trackingRepo.findByUserId(user.getId())
                    .stream()
                    .filter(tracking -> isValidTracking(tracking, startDate))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error fetching tracking entries for user " + user.getId() + ": " + e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Kiểm tra tracking entry có hợp lệ không.
     */
    private boolean isValidTracking(Tracking tracking, LocalDate startDate) {
        if (tracking == null || tracking.getDate() == null || tracking.getDate().trim().isEmpty()) {
            return false;
        }
        
        try {
            LocalDate trackingDate = LocalDate.parse(tracking.getDate().trim());
            return trackingDate.isAfter(startDate.minusDays(1));
        } catch (Exception e) {
            System.err.println("Invalid date format for tracking: " + tracking.getDate());
            return false;
        }
    }

    /**
     * Điền đầy đủ thông tin thống kê cho người dùng.
     */
    private void populateUserStats(LeaderboardUserDTO userStats, List<Tracking> trackingEntries,
                                 int consecutiveSmokFreeDays, LocalDate startDate, String startDateString,
                                 int totalDaysSinceQuit, String timeRange) {
        
        int totalPoints = calculateTotalPoints(trackingEntries, consecutiveSmokFreeDays, startDate);
        int weeklyPoints = calculateWeeklyPoints(trackingEntries, startDate);
        int monthlyPoints = calculateMonthlyPoints(trackingEntries, startDate);
        
        userStats.setTotalPoints(totalPoints);
        userStats.setWeeklyPoints(weeklyPoints);
        userStats.setMonthlyPoints(monthlyPoints);
        userStats.setStartDate(startDateString);
        userStats.setTotalDaysSinceQuit(totalDaysSinceQuit);
        userStats.setConsecutiveSmokFreeDays(consecutiveSmokFreeDays);
        userStats.setTier(calculateTierByTimeRange(timeRange, totalPoints, weeklyPoints, monthlyPoints));
    }

    /**
     * Tính số ngày không hút thuốc liên tiếp hiện tại.
     */
    private int calculateCurrentStreakDays(List<Tracking> trackingEntries, LocalDate startDate) {
        try {
            Optional<LocalDate> lastSmokingDate = findLastSmokingDate(trackingEntries);
            LocalDate streakStartDate = determineStreakStartDate(lastSmokingDate, startDate);
            
            if (isSmokingToday(lastSmokingDate)) {
                return 0;
            }
            
            int streakDays = (int) ChronoUnit.DAYS.between(streakStartDate, LocalDate.now());
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
            
            return Math.max(Math.min(streakDays, totalDaysSinceQuit), 0);
        } catch (Exception e) {
            System.err.println("Error calculating streak days: " + e.getMessage());
            return 0;
        }
    }

    /**
     * Tìm ngày hút thuốc gần nhất.
     */
    private Optional<LocalDate> findLastSmokingDate(List<Tracking> trackingEntries) {
        return trackingEntries.stream()
                .filter(tracking -> tracking != null && "smoking".equals(tracking.getType()))
                .map(this::parseTrackingDate)
                .filter(Objects::nonNull)
                .max(LocalDate::compareTo);
    }

    /**
     * Chuyển đổi chuỗi ngày thành LocalDate.
     */
    private LocalDate parseTrackingDate(Tracking tracking) {
        try {
            return tracking.getDate() != null ? LocalDate.parse(tracking.getDate().trim()) : null;
        } catch (Exception e) {
            System.err.println("Invalid date format in tracking: " + tracking.getDate());
            return null;
        }
    }

    /**
     * Xác định ngày bắt đầu chuỗi không hút thuốc.
     */
    private LocalDate determineStreakStartDate(Optional<LocalDate> lastSmokingDate, LocalDate startDate) {
        return lastSmokingDate.map(date -> date.plusDays(1)).orElse(startDate);
    }

    /**
     * Kiểm tra có hút thuốc hôm nay không.
     */
    private boolean isSmokingToday(Optional<LocalDate> lastSmokingDate) {
        return lastSmokingDate.isPresent() && lastSmokingDate.get().equals(LocalDate.now());
    }

    /**
     * Tính tổng điểm của người dùng.
     */
    private int calculateTotalPoints(List<Tracking> trackingEntries, int consecutiveSmokFreeDays, LocalDate startDate) {
        int points = 0;
        
        int totalDaysSinceStart = calculateTotalDaysSinceQuit(startDate);
        Set<LocalDate> smokingDates = getSmokingDates(trackingEntries);
        
        int actualSmokFreeDays = Math.max(totalDaysSinceStart - smokingDates.size(), 0);
        
        // Điểm cơ bản cho ngày không hút thuốc
        points += actualSmokFreeDays * DAILY_SMOKE_FREE_POINTS;
        
        // Điểm thưởng cho chuỗi ngày liên tiếp
        points += consecutiveSmokFreeDays * STREAK_BONUS_POINTS;
        
        // Điểm thưởng cho chuỗi tuần và tháng
        points += (consecutiveSmokFreeDays / 7) * WEEKLY_STREAK_BONUS;
        points += (consecutiveSmokFreeDays / 30) * MONTHLY_STREAK_BONUS;
        
        // Điểm thưởng cho ghi lại cảm giác thèm thuốc
        points += countCravingRecords(trackingEntries) * CRAVING_RECORD_POINTS;
        
        // Điểm phạt cho việc hút thuốc
        points -= countSmokingIncidents(trackingEntries) * SMOKING_PENALTY;
        
        return points;
    }

    /**
     * Lấy danh sách các ngày hút thuốc (không trùng lặp).
     */
    private Set<LocalDate> getSmokingDates(List<Tracking> trackingEntries) {
        return trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(this::parseTrackingDate)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    /**
     * Đếm số lần ghi lại cảm giác thèm thuốc.
     */
    private int countCravingRecords(List<Tracking> trackingEntries) {
        return (int) trackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
    }

    /**
     * Đếm số lần hút thuốc.
     */
    private int countSmokingIncidents(List<Tracking> trackingEntries) {
        return (int) trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
    }

    /**
     * Tính điểm trong 7 ngày gần nhất.
     */
    private int calculateWeeklyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        LocalDate effectiveStartDate = startDate.isAfter(weekAgo) ? startDate : weekAgo;
        
        List<Tracking> weeklyEntries = filterTrackingByDateRange(allTrackingEntries, effectiveStartDate, LocalDate.now());
        
        return calculatePointsForPeriod(weeklyEntries, effectiveStartDate, 7, WEEKLY_DAILY_POINTS, true, false);
    }

    /**
     * Tính điểm trong 30 ngày gần nhất.
     */
    private int calculateMonthlyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        LocalDate effectiveStartDate = startDate.isAfter(monthAgo) ? startDate : monthAgo;
        
        List<Tracking> monthlyEntries = filterTrackingByDateRange(allTrackingEntries, effectiveStartDate, LocalDate.now());
        
        return calculatePointsForPeriod(monthlyEntries, effectiveStartDate, 30, MONTHLY_DAILY_POINTS, true, true);
    }

    /**
     * Lọc tracking entries theo khoảng thời gian.
     */
    private List<Tracking> filterTrackingByDateRange(List<Tracking> trackingEntries, LocalDate startDate, LocalDate endDate) {
        return trackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        return trackingDate.isAfter(startDate.minusDays(1)) && 
                               trackingDate.isBefore(endDate.plusDays(1));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Tính điểm cho một khoảng thời gian cụ thể.
     */
    private int calculatePointsForPeriod(List<Tracking> trackingEntries, LocalDate startDate, int maxDays, 
                                       int dailyPoints, boolean weeklyBonus, boolean monthlyBonus) {
        int points = 0;
        
        int daysInPeriod = Math.min((int) ChronoUnit.DAYS.between(startDate, LocalDate.now()), maxDays);
        Set<LocalDate> smokingDates = getSmokingDates(trackingEntries);
        
        int smokeFreeDays = calculateSmokeFreeDaysInPeriod(startDate, daysInPeriod, smokingDates);
        
        // Điểm cơ bản
        points += smokeFreeDays * dailyPoints;
        
        // Điểm thưởng
        if (weeklyBonus && smokeFreeDays >= 7 && smokingDates.isEmpty()) {
            points += WEEKLY_STREAK_BONUS;
        }
        
        if (monthlyBonus) {
            points += (smokeFreeDays / 7) * WEEKLY_STREAK_BONUS;
            if (smokeFreeDays >= 30 && smokingDates.isEmpty()) {
                points += MONTHLY_STREAK_BONUS;
            }
        }
        
        // Điểm thưởng và phạt
        points += countCravingRecords(trackingEntries) * CRAVING_RECORD_POINTS;
        points -= countSmokingIncidents(trackingEntries) * SMOKING_PENALTY;
        
        return points;
    }

    /**
     * Tính số ngày không hút thuốc trong khoảng thời gian.
     */
    private int calculateSmokeFreeDaysInPeriod(LocalDate startDate, int totalDays, Set<LocalDate> smokingDates) {
        int smokeFreeDays = 0;
        for (int i = 0; i < totalDays; i++) {
            LocalDate dayToCheck = startDate.plusDays(i);
            if (!smokingDates.contains(dayToCheck)) {
                smokeFreeDays++;
            }
        }
        return smokeFreeDays;
    }

    /**
     * Xác định tier dựa trên phạm vi thời gian.
     */
    private String calculateTierByTimeRange(String timeRange, int totalPoints, int weeklyPoints, int monthlyPoints) {
    switch (timeRange) {
        case "weekly":
            return calculateTier(weeklyPoints);
        case "monthly":
            return calculateTier(monthlyPoints);
        default:
            return calculateTier(totalPoints);
    }
}
    /**
     * Xác định hạng của người dùng dựa trên điểm số.
     */
    private String calculateTier(int points) {
        if (points >= 1800) return "Legend";
        else if (points >= 1000) return "Diamond";
        else if (points >= 500) return "Platinum";
        else if (points >= 250) return "Gold";
        else if (points >= 80) return "Silver";
        else if (points >= 0) return "Bronze";
        else return "Struggling";
    }

    /**
     * Sắp xếp người dùng theo phạm vi thời gian.
     */
    private void sortUsersByTimeRange(List<LeaderboardUserDTO> users, String timeRange) {
    switch (timeRange) {
        case "weekly":
            users.sort((a, b) -> Integer.compare(b.getWeeklyPoints(), a.getWeeklyPoints()));
            break;
        case "monthly":
            users.sort((a, b) -> Integer.compare(b.getMonthlyPoints(), a.getMonthlyPoints()));
            break;
        default:
            users.sort((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()));
            break;
    }
}

    /**
     * Gán thứ hạng cho các người dùng.
     */
    private void assignRanks(List<LeaderboardUserDTO> users) {
        for (int i = 0; i < users.size(); i++) {
            users.get(i).setRank(i + 1);
        }
    }

    /**
     * Tìm người dùng hiện tại trong danh sách.
     */
    private LeaderboardUserDTO findCurrentUser(List<LeaderboardUserDTO> users, Integer currentUserId) {
        if (currentUserId == null) {
            return null;
        }
        
        return users.stream()
                .filter(u -> u.getId().equals(currentUserId))
                .findFirst()
                .orElse(null);
    }

    /**
     * Tạo response cho leaderboard.
     */
    private Map<String, Object> createLeaderboardResponse(List<LeaderboardUserDTO> leaderboard, 
                                                        LeaderboardUserDTO currentUser, String timeRange) {
        Map<String, Object> response = new HashMap<>();
        response.put("leaderboard", leaderboard);
        response.put("currentUser", currentUser);
        response.put("timeRange", timeRange);
        return response;
    }
}