package com.example.demo.service.UserDashboardService;

import com.example.demo.DTO.DashboardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor

public class DashboardService {

        private final DashboardUpdateService dashboardUpdateService;
        private final TrackingHistoryService trackingHistoryService;

        public ResponseEntity<DashboardDTO> getDashboard(Integer userId) {
            return dashboardUpdateService.getOrUpdateDashboard(userId);
        }

        public ResponseEntity<List<Map<String, Object>>> getTrackingHistory(Integer userId) {
            return trackingHistoryService.getHistory(userId);
        }

        public void handleDataUpdatedEvent(Integer userId) {
            dashboardUpdateService.forceUpdateDashboard(userId);
        }
}

