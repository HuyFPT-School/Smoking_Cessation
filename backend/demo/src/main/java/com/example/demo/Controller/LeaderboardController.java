package com.example.demo.Controller;

import com.example.demo.DTO.LeaderboardUserDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Post;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.PostRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;

@RestController
@CrossOrigin
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private TrackingRepo trackingRepo;

    @Autowired
    private PostRepo postRepo;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(defaultValue = "weekly") String timeRange,
            @RequestParam(required = false) Integer currentUserId) {
        try {
            // Validate timeRange parameter
            if (!Arrays.asList("weekly", "monthly", "all").contains(timeRange)) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid timeRange. Must be: weekly, monthly, or all"));
            }

            List<User> allUsers = userRepo.findAll();
            if (allUsers.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "leaderboard", new ArrayList<>(),
                    "currentUser", null,
                    "timeRange", timeRange
                ));
            }

            List<LeaderboardUserDTO> leaderboardUsers = new ArrayList<>();

            for (User user : allUsers) {
                try {
                    LeaderboardUserDTO leaderboardUser = calculateUserStats(user, timeRange);
                    if (leaderboardUser != null) {
                        leaderboardUsers.add(leaderboardUser);
                    }
                } catch (Exception e) {
                    System.err.println("Error calculating stats for user " + user.getId() + ": " + e.getMessage());
                    // Continue with other users instead of failing completely
                }
            }

            // Sort by appropriate points based on timeRange
            switch (timeRange) {
                case "weekly":
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getWeeklyPoints(), a.getWeeklyPoints()));
                    break;
                case "monthly":
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getMonthlyPoints(), a.getMonthlyPoints()));
                    break;
                default: // "all"
                    leaderboardUsers.sort((a, b) -> Integer.compare(b.getTotalPoints(), a.getTotalPoints()));
                    break;
            }

            // Assign ranks
            for (int i = 0; i < leaderboardUsers.size(); i++) {
                leaderboardUsers.get(i).setRank(i + 1);
            }

            // Find current user in leaderboard
            LeaderboardUserDTO currentUser = null;
            if (currentUserId != null) {
                currentUser = leaderboardUsers.stream()
                        .filter(u -> u.getId().equals(currentUserId))
                        .findFirst()
                        .orElse(null);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("leaderboard", leaderboardUsers);
            response.put("currentUser", currentUser);
            response.put("timeRange", timeRange);

            return ResponseEntity.ok(response);        } catch (Exception e) {
            System.err.println("Leaderboard error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to fetch leaderboard: " + e.getMessage()));
        }
    }



//    =====================================================HElP FUNCTIONS====================================================
    private LeaderboardUserDTO calculateUserStats(User user, String timeRange) {
        try {
            LeaderboardUserDTO userStats = new LeaderboardUserDTO();
            userStats.setId(user.getId());
            userStats.setName(user.getName());
            userStats.setAvatarUrl(user.getAvatarUrl());

            // Determine start date with better error handling
            LocalDate startDate = LocalDate.now(); // Default fallback
            String startDateString = null;

            try {
                // Priority 1: Get quitDate from Plan
                Optional<Plan> planOpt = planRepo.findByUserId(String.valueOf(user.getId()));
                if (planOpt.isPresent()) {
                    Plan plan = planOpt.get();
                    if (plan.getQuitDate() != null) {
                        startDate = plan.getQuitDate();
                        startDateString = startDate.toString();
                    }
                }
                
                // Priority 2: Use user registration date if no Plan or no quitDate
                if (startDateString == null && user.getCreateAt() != null) {
                    startDate = user.getCreateAt().toLocalDate();
                    startDateString = startDate.toString();
                }
                
                // Priority 3: If no start date available, use current date
                if (startDateString == null) {
                    startDate = LocalDate.now();
                    startDateString = startDate.toString();
                }
            } catch (Exception e) {
                System.err.println("Error determining start date for user " + user.getId() + ": " + e.getMessage());
                startDate = LocalDate.now();
                startDateString = startDate.toString();
            }

            // Calculate total days since start date
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
            if (totalDaysSinceQuit < 0) totalDaysSinceQuit = 0;

            final LocalDate finalStartDate = startDate;

            // Get all tracking entries with better error handling
            List<Tracking> allTrackingEntries = new ArrayList<>();
            try {
                allTrackingEntries = trackingRepo.findByUserId(user.getId())
                        .stream()
                        .filter(tracking -> {
                            if (tracking == null || tracking.getDate() == null || tracking.getDate().trim().isEmpty()) {
                                return false;
                            }
                            try {
                                LocalDate trackingDate = LocalDate.parse(tracking.getDate().trim());
                                return trackingDate.isAfter(finalStartDate.minusDays(1));
                            } catch (Exception e) {
                                System.err.println("Invalid date format for tracking: " + tracking.getDate());
                                return false;
                            }
                        })
                        .collect(Collectors.toList());
            } catch (Exception e) {
                System.err.println("Error fetching tracking entries for user " + user.getId() + ": " + e.getMessage());
                allTrackingEntries = new ArrayList<>();
            }

            // Calculate current consecutive smoke-free days
            int consecutiveSmokFreeDays = calculateCurrentStreakDays(allTrackingEntries, finalStartDate);

            // Calculate points based on time range
            int totalPoints = calculateTotalPoints(allTrackingEntries, consecutiveSmokFreeDays, finalStartDate);
            int weeklyPoints = calculateWeeklyPoints(allTrackingEntries, finalStartDate);
            int monthlyPoints = calculateMonthlyPoints(allTrackingEntries, finalStartDate);

            userStats.setTotalPoints(totalPoints);
            userStats.setWeeklyPoints(weeklyPoints);
            userStats.setMonthlyPoints(monthlyPoints);
            userStats.setStartDate(startDateString);
            userStats.setTotalDaysSinceQuit(totalDaysSinceQuit);
            userStats.setConsecutiveSmokFreeDays(consecutiveSmokFreeDays);
            userStats.setTier(calculateTier(totalPoints));

            return userStats;
        } catch (Exception e) {
            System.err.println("Error calculating user stats for user " + user.getId() + ": " + e.getMessage());
            return null;
        }
    }




    // Calculate current consecutive smoke-free days since last smoking incident
    private int calculateCurrentStreakDays(List<Tracking> trackingEntries, LocalDate startDate) {
        try {
            // Find the most recent smoking incident
            Optional<LocalDate> lastSmokingDate = trackingEntries.stream()
                    .filter(tracking -> tracking != null && "smoking".equals(tracking.getType()))
                    .map(tracking -> {
                        try {
                            return tracking.getDate() != null ? LocalDate.parse(tracking.getDate().trim()) : null;
                        } catch (Exception e) {
                            System.err.println("Invalid date format in smoking tracking: " + tracking.getDate());
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .max(LocalDate::compareTo);

            LocalDate streakStartDate;
            if (lastSmokingDate.isPresent()) {
                streakStartDate = lastSmokingDate.get().plusDays(1);
            } else {
                streakStartDate = startDate;
            }

            int streakDays = (int) ChronoUnit.DAYS.between(streakStartDate, LocalDate.now());
            int totalDaysSinceQuit = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());

            if (lastSmokingDate.isPresent() && lastSmokingDate.get().equals(LocalDate.now())) {
                return 0;
            }

            return Math.max(Math.min(streakDays, totalDaysSinceQuit), 0);
        } catch (Exception e) {
            System.err.println("Error calculating streak days: " + e.getMessage());
            return 0;
        }
    }





    // Calculate total points using hybrid scoring system
    private int calculateTotalPoints(List<Tracking> trackingEntries, int consecutiveSmokFreeDays, LocalDate startDate) {
        int points = 0;
        
        // 1. Calculate actual smoke-free days (total days minus smoking incident days)
        int totalDaysSinceStart = (int) ChronoUnit.DAYS.between(startDate, LocalDate.now());
        if (totalDaysSinceStart < 0) totalDaysSinceStart = 0;
        
        // Get unique smoking incident dates
        Set<LocalDate> smokingDates = trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        int actualSmokFreeDays = totalDaysSinceStart - smokingDates.size();
        actualSmokFreeDays = Math.max(actualSmokFreeDays, 0);
        
        // 2. Base points for accumulated smoke-free days (+8 points per actual smoke-free day)
        points += actualSmokFreeDays * 8;
        
        // 3. Consecutive streak bonus (+2 points per consecutive day)
        points += consecutiveSmokFreeDays * 2;
        
        // 4. Weekly streak bonuses (+40 points for each complete 7-day streak)
        int weeklyStreaks = consecutiveSmokFreeDays / 7;
        points += weeklyStreaks * 40;
        
        // 5. Monthly streak bonuses (+150 points for each complete 30-day streak)
        int monthlyStreaks = consecutiveSmokFreeDays / 30;
        points += monthlyStreaks * 150;
        
        // 6. Craving awareness bonus (+4 points per craving record)
        long cravingRecords = trackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) cravingRecords * 4;
          // 7. Apply reduced penalties for smoking incidents (-15 points each)
        long smokingIncidents = trackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        
        int penalty = (int) smokingIncidents * 15;
        points = points - penalty;
        
        return points;
    }

    // Calculate weekly points (points earned in the last 7 days)
    private int calculateWeeklyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        LocalDate effectiveStartDate = startDate.isAfter(weekAgo) ? startDate : weekAgo;
        
        // Get tracking entries in the last week
        List<Tracking> weeklyTrackingEntries = allTrackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        return trackingDate.isAfter(effectiveStartDate.minusDays(1)) && 
                               trackingDate.isBefore(LocalDate.now().plusDays(1));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
        
        // Calculate points for this week
        int points = 0;
        
        // Days in this week that are smoke-free
        int daysInWeek = (int) ChronoUnit.DAYS.between(effectiveStartDate, LocalDate.now());
        daysInWeek = Math.min(daysInWeek, 7);
        
        // Get smoking dates in this week
        Set<LocalDate> weeklySmokingDates = weeklyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Calculate smoke-free days in this week
        int smokeFreeDaysInWeek = 0;
        for (int i = 0; i < daysInWeek; i++) {
            LocalDate dayToCheck = effectiveStartDate.plusDays(i);
            if (!weeklySmokingDates.contains(dayToCheck)) {
                smokeFreeDaysInWeek++;
            }
        }
          // Base points for smoke-free days
        points += smokeFreeDaysInWeek * 10;
        
        // Weekly streak bonus if 7 consecutive days
        if (smokeFreeDaysInWeek >= 7 && weeklySmokingDates.isEmpty()) {
            points += 40;
        }
        
        // Add craving bonuses first
        long weeklyCravingRecords = weeklyTrackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) weeklyCravingRecords * 4;
          // Apply penalties and allow negative points
        long weeklySmokingIncidents = weeklyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        int penalty = (int) weeklySmokingIncidents * 15;
        points = points - penalty;
        
        return points;
    }

    // Calculate monthly points (points earned in the last 30 days)
    private int calculateMonthlyPoints(List<Tracking> allTrackingEntries, LocalDate startDate) {
        LocalDate monthAgo = LocalDate.now().minusDays(30);
        LocalDate effectiveStartDate = startDate.isAfter(monthAgo) ? startDate : monthAgo;
        
        // Get tracking entries in the last month
        List<Tracking> monthlyTrackingEntries = allTrackingEntries.stream()
                .filter(tracking -> {
                    try {
                        LocalDate trackingDate = LocalDate.parse(tracking.getDate());
                        return trackingDate.isAfter(effectiveStartDate.minusDays(1)) && 
                               trackingDate.isBefore(LocalDate.now().plusDays(1));
                    } catch (Exception e) {
                        return false;
                    }
                })
                .collect(Collectors.toList());
        
        // Calculate points for this month
        int points = 0;
        
        // Days in this month that are smoke-free
        int daysInMonth = (int) ChronoUnit.DAYS.between(effectiveStartDate, LocalDate.now());
        daysInMonth = Math.min(daysInMonth, 30);
        
        // Get smoking dates in this month
        Set<LocalDate> monthlySmokingDates = monthlyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .map(tracking -> {
                    try {
                        return LocalDate.parse(tracking.getDate());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        
        // Calculate smoke-free days in this month
        int smokeFreeDaysInMonth = 0;
        for (int i = 0; i < daysInMonth; i++) {
            LocalDate dayToCheck = effectiveStartDate.plusDays(i);
            if (!monthlySmokingDates.contains(dayToCheck)) {
                smokeFreeDaysInMonth++;
            }
        }
          // Base points for smoke-free days
        points += smokeFreeDaysInMonth * 10;
        
        // Streak bonuses for this month
        int weeklyStreaks = smokeFreeDaysInMonth / 7;
        points += weeklyStreaks * 40;
        
        if (smokeFreeDaysInMonth >= 30 && monthlySmokingDates.isEmpty()) {
            points += 150; // 30-day streak bonus
        }
        
        // Add craving bonuses first
        long monthlyCravingRecords = monthlyTrackingEntries.stream()
                .filter(tracking -> "craving".equals(tracking.getType()))
                .count();
        points += (int) monthlyCravingRecords * 4;
          // Apply penalties and allow negative points
        long monthlySmokingIncidents = monthlyTrackingEntries.stream()
                .filter(tracking -> "smoking".equals(tracking.getType()))
                .count();
        int penalty = (int) monthlySmokingIncidents * 15;
        points = points - penalty;
        
        return points;
    }    private String calculateTier(int totalPoints) {
        if (totalPoints >= 1800) return "Legend";
        else if (totalPoints >= 1000) return "Diamond";
        else if (totalPoints >= 500) return "Platinum";
        else if (totalPoints >= 250) return "Gold";
        else if (totalPoints >= 80) return "Silver";
        else if (totalPoints >= 0) return "Bronze";
        else return "Struggling";
    }
}
