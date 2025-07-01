package com.example.demo.Controller;

import com.example.demo.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

/**
 * Controller xử lý các API liên quan đến bảng xếp hạng.
 * Chỉ chứa logic điều khiển HTTP, không chứa business logic.
 */
@RestController
@CrossOrigin
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private static final String[] VALID_TIME_RANGES = {"weekly", "monthly", "all"};

    @Autowired
    private LeaderboardService leaderboardService;

    /**
     * API lấy dữ liệu bảng xếp hạng.
     *
     * @param timeRange Phạm vi thời gian (weekly, monthly, all)
     * @param currentUserId ID của người dùng hiện tại
     * @return ResponseEntity chứa dữ liệu bảng xếp hạng
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getLeaderboard(
            @RequestParam(defaultValue = "weekly") String timeRange,
            @RequestParam(required = false) Integer currentUserId) {

        try {
            if (!isValidTimeRange(timeRange)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid timeRange. Must be: weekly, monthly, or all"));
            }

            Map<String, Object> leaderboardData = leaderboardService.getLeaderboardData(timeRange, currentUserId);
            return ResponseEntity.ok(leaderboardData);

        } catch (Exception e) {
            System.err.println("Leaderboard error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Failed to fetch leaderboard: " + e.getMessage()));
        }
    }

    /**
     * Kiểm tra phạm vi thời gian có hợp lệ không.
     */
    private boolean isValidTimeRange(String timeRange) {
        return Arrays.asList(VALID_TIME_RANGES).contains(timeRange);
    }
}