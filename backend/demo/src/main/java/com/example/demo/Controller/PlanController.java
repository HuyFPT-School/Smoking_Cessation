package com.example.demo.Controller;

import com.example.demo.DTO.PlanDTO;
import com.example.demo.DTO.RewardItemDTO;
import com.example.demo.entity.Plan;
import com.example.demo.entity.RewardItem;
import com.example.demo.Repo.PlanRepo;
// import com.example.demo.Repo.UserRepo; // Assuming UserRepo exists for validation if needed
import com.example.demo.utils.DataUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController // Đánh dấu đây là REST controller, tự động xử lý HTTP requests/responses
@RequestMapping("/api/plans") // Đường dẫn cơ sở cho tất cả API trong controller này
@CrossOrigin // Cho phép truy cập từ các domain khác
public class PlanController {
    
    //tương tác với cơ sở dữ liệu.
    @Autowired
    private PlanRepo planRepo;

    //  ApplicationEventPublisher - Để thông báo cập nhật dữ liệu
    //  
    //  Khi kế hoạch được tạo/cập nhật/xóa, sẽ gửi thông báo đến các component khác
    //  để họ biết cần cập nhật lại dữ liệu (ví dụ: leaderboard cần tính lại điểm)
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    //   DateTimeFormatter - Định dạng ngày tháng chuẩn
    //   
    //   Sử dụng format ISO: YYYY-MM-DD (ví dụ: 2025-06-16)
    //   Đảm bảo tính nhất quán khi chuyển đổi giữa String và LocalDate
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE;

    // PHƯƠNG THỨC CHUYỂN ĐỔI TỪ PLAN ENTITY SANG PLANDTO
    private PlanDTO convertToDTO(Plan plan) {
        if (plan == null) return null; // Kiểm tra null safety
        return new PlanDTO(
                plan.getId(),         // ID của kế hoạch
                plan.getUserId(),     // ID người dùng sở hữu kế hoạch
                plan.getQuitDate() != null ? plan.getQuitDate().format(dateFormatter) : null, // Chuyển ngày thành string
                plan.getQuitMethod(),          // Phương pháp cai thuốc
                plan.getCigarettesPerDay(),    // Số điếu thuốc/ngày trước khi cai
                plan.getTriggers(),            // Các yếu tố kích thích hút thuốc
                plan.getCopingStrategies(),    // Chiến lược đối phó
                plan.getSupportNetwork(),      // Mạng lưới hỗ trợ
                plan.getAdditionalNotes(),     // Ghi chú bổ sung
                // Chuyển đổi danh sách RewardItem thành RewardItemDTO
                plan.getRewards() != null ? plan.getRewards().stream()
                        .map(r -> new RewardItemDTO(r.getMilestone(), r.getReward())) // Chuyển từng reward
                        .collect(Collectors.toList()) : null  // Thu thập thành List mới
        );
    }

    // PHƯƠNG THỨC CHUYỂN ĐỔI TỪ PLANDTO SANG PLAN ENTITY
    private Plan convertToEntity(PlanDTO planDTO, Plan existingPlan) {
        // Sử dụng kế hoạch hiện có hoặc tạo mới
        Plan plan = existingPlan != null ? existingPlan : new Plan();
        // Set các thuộc tính cơ bản
        plan.setUserId(planDTO.getUserId());
        // Chuyển đổi ngày từ String sang LocalDate (nếu có)
        if (planDTO.getQuitDate() != null && !planDTO.getQuitDate().isEmpty()) {
            plan.setQuitDate(LocalDate.parse(planDTO.getQuitDate(), dateFormatter));
        }
        // Set các thông tin khác
        plan.setQuitMethod(planDTO.getQuitMethod());                    // Phương pháp cai thuốc
        plan.setCigarettesPerDay(planDTO.getCigarettesPerDay());        // Số điếu/ngày
        plan.setTriggers(planDTO.getTriggers());                        // Yếu tố kích thích
        plan.setCopingStrategies(planDTO.getCopingStrategies());        // Chiến lược đối phó
        plan.setSupportNetwork(planDTO.getSupportNetwork());            // Mạng lưới hỗ trợ
        plan.setAdditionalNotes(planDTO.getAdditionalNotes());          // Ghi chú

        // Chuyển đổi danh sách phần thưởng (nếu có)
        if (planDTO.getRewards() != null) {
            plan.setRewards(planDTO.getRewards().stream()
                    .map(rDTO -> new RewardItem(rDTO.getMilestone(), rDTO.getReward())) // Chuyển từng reward
                    .collect(Collectors.toList())); // Thu thập thành List
        }
        return plan;
    }

    //    API TẠO KẾ HOẠCH CAI THUỐC MỚI ===
    //   
    //   Quy tắc nghiệp vụ:
    //   - Mỗi người dùng chỉ được có 1 kế hoạch duy nhất
    //   - Nếu đã có kế hoạch thì trả về lỗi CONFLICT (409)
    //   - Nếu muốn cập nhật kế hoạch, sử dụng PUT endpoint
    //  
    //   Luồng xử lý:
    //   1. Nhận dữ liệu PlanDTO từ client
    //   2. Kiểm tra xem user đã có kế hoạch chưa
    //   3. Nếu chưa có: tạo mới và lưu vào database
    //   4. Nếu đã có: trả về lỗi CONFLICT với kế hoạch hiện tại
    //   5. Gửi thông báo cập nhật dữ liệu cho các component khác
    //   
    //   planDTO - Thông tin kế hoạch từ client
    //   return ResponseEntity chứa kế hoạch vừa tạo hoặc thông báo lỗi
    //   
    //   URL: POST /api/plans
    //   Body: {
    //     "userId": "123",
    //     "quitDate": "2025-07-01",
    //     "quitMethod": "Gradually reduce",
    //     "cigarettesPerDay": 20,
    //     "triggers": "Stress, after meals",
    //     "copingStrategies": "Exercise, meditation",
    //     "supportNetwork": "Family, friends",
    //     "additionalNotes": "Want to quit for health",
    //     "rewards": [
    //       {"milestone": "1 week", "reward": "Buy a book"},
    //       {"milestone": "1 month", "reward": "Go to spa"}
    //     ]
    //   }

    @PostMapping
    public ResponseEntity<PlanDTO> createPlan(@RequestBody PlanDTO planDTO) {

        // Kiểm tra xem người dùng đã có kế hoạch chưa
        Optional<Plan> existingPlanOpt = planRepo.findByUserId(planDTO.getUserId());
        if (existingPlanOpt.isPresent()) {
            // Nếu đã có kế hoạch, trả về mã lỗi CONFLICT (409)
            // Đây là thiết kế nghiêm ngặt: POST chỉ để tạo mới, không update
            // Nếu muốn tạo hoặc cập nhật, sử dụng PUT /api/plans/user/{userId}
            return ResponseEntity.status(HttpStatus.CONFLICT).body(convertToDTO(existingPlanOpt.get()));
        }

        // Tạo kế hoạch mới
        Plan plan = convertToEntity(planDTO, null); // null = tạo mới, không update
        Plan savedPlan = planRepo.save(plan);  // Lưu vào database

        // Gửi thông báo cập nhật dữ liệu (để leaderboard, notification... cập nhật lại)
        eventPublisher.publishEvent(new DataUpdatedEvent(this, planDTO.getUserId()));

        // Trả về kế hoạch vừa tạo với status 201 CREATED
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedPlan));
    }

    //  === API LẤY KẾ HOẠCH CAI THUỐC THEO USER ID ===
    //   
    //   Endpoint này cho phép lấy kế hoạch cai thuốc của một người dùng cụ thể.
    //   
    //   Đây là API chính được sử dụng bởi:
    //   - Trang Plan.jsx để hiển thị kế hoạch hiện tại
    //   - Các component khác cần biết thông tin kế hoạch của user
    //   - Dashboard để hiển thị tóm tắt kế hoạch
    //   
    //   Luồng xử lý:
    //   1. Nhận userId từ URL path
    //   2. Tìm kế hoạch trong database theo userId
    //   3. Nếu có: chuyển đổi thành DTO và trả về
    //   4. Nếu không có: trả về 404 NOT FOUND
    //   
    //   userId - ID của người dùng (lấy từ URL path)
    //   return ResponseEntity chứa kế hoạch hoặc 404 nếu không tìm thấy
    //   
    //   URL: GET /api/plans/user/123
    //   
    //   Response thành công (200):
    //   {
    //     "id": 456,
    //     "userId": "123",
    //     "quitDate": "2025-07-01",
    //     "quitMethod": "Gradually reduce",
    //     "cigarettesPerDay": 20,
    //     "triggers": "Stress, after meals",
    //     "copingStrategies": "Exercise, meditation",
    //     "supportNetwork": "Family, friends",
    //     "additionalNotes": "Want to quit for health",
    //     "rewards": [...]
    //   } 

    @GetMapping("/user/{userId}")
    public ResponseEntity<PlanDTO> getPlanByUserId(@PathVariable Integer userId) {
        // Tìm kế hoạch theo userId
        Optional<Plan> plan = planRepo.findByUserId(userId);

        // Sử dụng Optional.map() để xử lý có/không có dữ liệu 
        return plan.map(value -> ResponseEntity.ok(convertToDTO(value)))  // Nếu có: trả về 200 OK
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));  // Nếu không: 404
    }

    //  === API CẬP NHẬT KẾ HOẠCH THEO PLAN ID ===
    //   
    //   Endpoint này cho phép cập nhật kế hoạch dựa trên ID của kế hoạch.
    //   
    //   Chú ý: Endpoint này ít được sử dụng trong thực tế vì:
    //   - Client thường chỉ biết userId, không biết planId
    //   - Plan.jsx sử dụng endpoint /user/{userId} thay vì endpoint này
    //   - Được giữ lại để tương thích với các client khác (nếu có)
    //   
    //   Quy tắc bảo mật:
    //   - Không cho phép thay đổi userId (chủ sở hữu kế hoạch)
    //   - Nếu userId trong DTO khác với userId của kế hoạch hiện tại -> lỗi 400
    //   
    //   Luồng xử lý:
    //   1. Tìm kế hoạch hiện tại theo planId
    //   2. Kiểm tra kế hoạch có tồn tại không
    //   3. Validate userId không được thay đổi
    //   4. Cập nhật kế hoạch với dữ liệu mới
    //   5. Gửi thông báo cập nhật dữ liệu
    //   
    //   planId - ID của kế hoạch cần cập nhật
    //   planDTO - Dữ liệu mới cho kế hoạch
    //   return ResponseEntity chứa kế hoạch đã cập nhật hoặc thông báo lỗi
    //   
    //   URL: PUT /api/plans/456

    @PutMapping("/{planId}")
    public ResponseEntity<PlanDTO> updatePlanById(@PathVariable Long planId, @RequestBody PlanDTO planDTO) {
        // Tìm kế hoạch hiện tại
        Optional<Plan> existingPlanOpt = planRepo.findById(planId);
        if (existingPlanOpt.isEmpty()) {
            // Kế hoạch không tồn tại
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        // Kiểm tra bảo mật: không cho phép thay đổi chủ sở hữu kế hoạch
        if (!existingPlanOpt.get().getUserId().equals(planDTO.getUserId())) {
            // Nếu userId trong DTO khác với userId của kế hoạch hiện tại
            // -> Có thể là người dùng đang cố gắng chiếm đoạt kế hoạch của người khác
            // -> Trả về lỗi BAD REQUEST
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        
        // Cập nhật kế hoạch
        Plan planToUpdate = convertToEntity(planDTO, existingPlanOpt.get()); // Merge với kế hoạch hiện tại
        planToUpdate.setId(planId); // Đảm bảo ID không bị thay đổi
        Plan updatedPlan = planRepo.save(planToUpdate); // Lưu vào database

        // Gửi thông báo cập nhật dữ liệu
        eventPublisher.publishEvent(new DataUpdatedEvent(this, planDTO.getUserId()));

        // Trả về kế hoạch đã cập nhật
        return ResponseEntity.ok(convertToDTO(updatedPlan));
    }

    // === API TẠO HOẶC CẬP NHẬT KẾ HOẠCH THEO USER ID (UPSERT) ===
    //   
    //   Đây là endpoint QUAN TRỌNG NHẤT trong PlanController!
    //   
    //   Tính năng "Upsert" (Update + Insert):
    //   - Nếu người dùng chưa có kế hoạch: TẠO MỚI (INSERT)
    //   - Nếu người dùng đã có kế hoạch: CẬP NHẬT (UPDATE)
    //   - Người dùng không cần quan tâm có kế hoạch hay chưa
    //   
    //   Đây là endpoint được sử dụng bởi Plan.jsx khi người dùng:
    //   - Lần đầu tạo kế hoạch cai thuốc
    //   - Chỉnh sửa kế hoạch hiện tại
    //   - Thêm/sửa phần thưởng
    //   
    //   Tính năng bảo mật:
    //   - Ưu tiên userId từ URL path thay vì từ request body
    //   - Validate consistency giữa path và body
    //   - Tự động set userId nếu missing trong body
    //   
    //   Luồng xử lý:
    //   1. Lấy userId từ URL path
    //   2. Validate và sync userId giữa path và body
    //   3. Tìm kế hoạch hiện tại của user
    //   4. Nếu có: cập nhật kế hoạch hiện tại
    //   5. Nếu không: tạo kế hoạch mới
    //   6. Lưu vào database và gửi thông báo
    //   7. Trả về status phù hợp (201 cho tạo mới, 200 cho cập nhật)
    //   
    //   userId - ID người dùng từ URL path
    //   param planDTO - Dữ liệu kế hoạch từ request body
    //   return ResponseEntity với kế hoạch đã lưu và status code phù hợp
    //   
    //   URL: PUT /api/plans/user/123
    //   Body: { "userId": "123", "quitDate": "2025-07-01", ... }
    //   
    //   Response tạo mới (201): { "id": 456, "userId": "123", ... }
    //   Response cập nhật (200): { "id": 456, "userId": "123", ... }

    @PutMapping("/user/{userId}")
    public ResponseEntity<PlanDTO> createOrUpdatePlanByUserId(@PathVariable Integer userId, @RequestBody PlanDTO planDTO) {
        // Xử lý và validate userId
        if (planDTO.getUserId() == null ) {
            // Nếu userId không có trong body, lấy từ path
            planDTO.setUserId(userId);
        } else if (!userId.equals(planDTO.getUserId())) {
            // Nếu userId trong path khác với userId trong body
            // -> Có thể là lỗi từ phía client hoặc cố tình thay đổi
            // -> Trả về BAD REQUEST để báo lỗi
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
 
        // Tìm kế hoạch hiện tại của user
        Optional<Plan> existingPlanOpt = planRepo.findByUserId(userId);
        Plan planToSave;
        boolean isCreating = false;

        if (existingPlanOpt.isPresent()) {
            // TRƯỜNG HỢP 1: User đã có kế hoạch -> CẬP NHẬT
            planToSave = convertToEntity(planDTO, existingPlanOpt.get()); // Merge với kế hoạch hiện tại
            planToSave.setId(existingPlanOpt.get().getId()); // Giữ nguyên ID cũ
        } else {
            // TRƯỜNG HỢP 2: User chưa có kế hoạch -> TẠO MỚI
            planToSave = convertToEntity(planDTO, null); // Tạo kế hoạch hoàn toàn mới
            isCreating = true;
        }

        // Lưu kế hoạch vào database
        Plan savedPlan = planRepo.save(planToSave);

        // Gửi thông báo cập nhật dữ liệu cho các component khác
        eventPublisher.publishEvent(new DataUpdatedEvent(this, userId));

        // Chuyển đổi thành DTO để trả về
        PlanDTO responseDTO = convertToDTO(savedPlan);

        if (isCreating) {
            return ResponseEntity.status(HttpStatus.CREATED).body(responseDTO); // HTTP 201 for create
        } else {
            return ResponseEntity.ok(responseDTO); // HTTP 200 for update
        }
    }
}