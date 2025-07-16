package com.example.demo.service.UserDashboardService;

import com.example.demo.DTO.DashboardDTO;
import com.example.demo.Repo.DashboardRepo;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.entity.Dashboard;
import com.example.demo.entity.Plan;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class DashboardUpdateService {

    private final DashboardRepo dashboardRepo;
    private final PlanRepo planRepo;
    private final TrackingRepo trackingRepo;
    private final UserRepo userRepo;
    private final DashboardMetricsService dashboardMetricsService;
    private final MilestoneService milestoneService;
    private final SimpMessagingTemplate messagingTemplate;

    public ResponseEntity<DashboardDTO> getOrUpdateDashboard(Integer userId) {

        // Tìm User xem có tồn tai chưa
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        // Tìm Plan xem có tồn tai chưa
        Optional<Plan> planOpt = planRepo.findByUserId(userId);
        if (planOpt.isEmpty()) return ResponseEntity.notFound().build();


        // Khi Plan có thì nó sẽ chạy tiếp
        // Lấy quitedate xem user đã lập kế hoạch ở plan chưa
        Plan plan = planOpt.get();
        LocalDate quitDate = plan.getQuitDate();
        int cigarettesPerDay = plan.getCigarettesPerDay();

        //️Chạy tới đây nó sẽ kiểm tra quitDate có null ko, nếu null thì trả về lỗi và kết thúc.
        if (quitDate == null) {
            return ResponseEntity.badRequest().body(DashboardDTO.builder()
                    .userId(userId)
                    .nextMilestone("No quit date set")
                    .remainingDaysToMilestone(0)
                    .cigarettesPerDay(cigarettesPerDay)
                    .quitDate(null)
                    .topTriggers(Collections.emptyList())
                    .build());
        }


        // Lấy thời gian hiện tại
        LocalDate today = LocalDate.now();

        // Truyền thời gian hiện tại vào findByUserIdAndRecordedDate để lấy dashboard với tời gian là hôm nay
        Optional<Dashboard> existing = dashboardRepo.findByUserIdAndRecordedDate(userId, today);
        List<Tracking> trackings = trackingRepo.findByUserId(userId);

        // Nếu hôm nay có dữ liệu thì nó sẽ trả về dashboard lấy được đó thông qua createDTOFromExisting
        if (existing.isPresent()) {
            Dashboard dashboard = existing.get();
            return ResponseEntity.ok(dashboardMetricsService.createDTOFromExisting(dashboard, plan, userId));
        }

        // Nếu hôm nay chưa có dữ liệu thì nó sẽ tính toán thủ công và  trả về thông qua updateDashboard
        DashboardDTO dto = updateDashboard(userId, plan, trackings, quitDate, cigarettesPerDay);
        return ResponseEntity.ok(dto);
    }


    // Cập nhật lại Dashboard cho một người dùng nhất định
    public void forceUpdateDashboard(Integer userId) {

        //Tìm Plan tương ứng với userId
        //Nếu không có Plan (người dùng chưa thiết lập kế hoạch cai thuốc) → kết thúc luôn
        Optional<Plan> planOpt = planRepo.findByUserId(userId);
        if (planOpt.isEmpty()) return;


        //Lấy quitDate (ngày bắt đầu bỏ thuốc) và số điếu hút mỗi ngày
        //Nếu quitDate chưa đặt → không thể tính dashboard → return luôn
        Plan plan = planOpt.get();
        LocalDate quitDate = plan.getQuitDate();
        int cigarettesPerDay = plan.getCigarettesPerDay();
        if (quitDate == null) return;

        List<Tracking> trackings = trackingRepo.findByUserId(userId);

        //Gọi hàm updateDashboard(...) để:
        // Tính toán lại các chỉ số (days smoke-free, money saved, ...)
        // Lưu Dashboard mới vào DB
        // Gửi dữ liệu mới qua WebSocket tới frontend
        updateDashboard(userId, plan, trackings, quitDate, cigarettesPerDay);
    }


    // Hàm này đươc gọi khi cần update và render lại, hoặc chưa có gì cần tính toán để render
    private DashboardDTO updateDashboard(Integer userId, Plan plan, List<Tracking> trackings,
                                         LocalDate quitDate, int cigarettesPerDay) {
        LocalDate today = LocalDate.now();
        var basic = dashboardMetricsService.calculateBasic(userId, quitDate, trackings, cigarettesPerDay);
        var milestone = milestoneService.calculate(plan, basic.getDaysSmokeFree());
        var timeMetrics = dashboardMetricsService.calculateTimeBased(trackings);
        List<String> topTriggers = trackingRepo.findTop3Triggers(userId);

        // Nếu đã có bản ghi dashboard cho hôm nay → xóa đi để ghi bản mới (tránh trùng), vì khi render lại do update thì dashboard hôm đó đã có rồi ta xóa đi và thêm mới (Update trá hình)
        dashboardRepo.findByUserIdAndRecordedDate(userId, today).ifPresent(dashboardRepo::delete);

        // Lưu dũ liệu mới nhất xuống database
        Dashboard dashboard = dashboardMetricsService.saveDashboard(userId, basic, milestone, timeMetrics);

        // Tao DTO và đẩy dữ liệu lên
        DashboardDTO dto = dashboardMetricsService.createDashboardDTO(userId, basic, milestone, timeMetrics, quitDate, topTriggers, cigarettesPerDay);

        // Cái này là websocket, là bean của Spring (SimpMessagingTemplate) dùng để gửi message tới các client đang subcribe một topic cụ thể qua WebSocket.
        // → Ngay lập tức dữ liệu dto được gửi đến frontend qua WebSocket mà không cần frontend phải fetch thủ công.
        messagingTemplate.convertAndSend("/topic/dashboard/" + userId, dto);
        return dto;
    }
}

