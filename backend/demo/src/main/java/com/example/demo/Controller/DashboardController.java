package com.example.demo.Controller;

import com.example.demo.DTO.DashboardDTO;
import com.example.demo.service.UserDashboardService.DashboardService;
import com.example.demo.utils.DataUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/{userId}")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Integer userId) {
        return dashboardService.getDashboard(userId);
    }

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getTrackingHistory(@PathVariable Integer userId) {
        return dashboardService.getTrackingHistory(userId);
    }

    @EventListener
    @Async
    @Transactional
    public void handleDataUpdatedEvent(DataUpdatedEvent event) {
        dashboardService.handleDataUpdatedEvent(event.getUserId());
    }
}
