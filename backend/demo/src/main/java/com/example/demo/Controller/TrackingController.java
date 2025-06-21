package com.example.demo.Controller;

import com.example.demo.DTO.TrackingDTO;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.utils.DataUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tracking") // Xác định đường dẫn gốc cho tất cả các API trong lớp này. Mọi yêu cầu sẽ bắt đầu bằng "/api/tracking".
public class TrackingController {

    // Đây là một thuộc tính để tương tác với bảng  trong cơ sở dữ liệu.     
    @Autowired
    private TrackingRepo trackingRepo;

    @Autowired
    private UserRepo userRepo; // Assuming you have a UserRepo
    
    //  ApplicationEventPublisher - Để thông báo cập nhật dữ liệu
    //  
    //  Khi kế hoạch được tạo/cập nhật/xóa, sẽ gửi thông báo đến các component khác
    //  để họ biết cần cập nhật lại dữ liệu (ví dụ: leaderboard cần tính lại điểm)
    @Autowired
    private ApplicationEventPublisher eventPublisher;

    // API này dùng để tạo một bản ghi theo dõi mới (ví dụ: ghi lại lần hút thuốc).
    @PostMapping
    public ResponseEntity<?> createTracking(@RequestBody TrackingDTO trackingDTO) {
        // 1. KIỂM TRA NGƯỜI DÙNG CÓ TỒN TẠI KHÔNG
        // Tìm người dùng trong database dựa trên userId được gửi từ frontend
        Optional<User> userOptional = userRepo.findById(Integer.valueOf(trackingDTO.getUserId()));
        
        // Nếu không tìm thấy người dùng, trả về lỗi 400 Bad Request
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        // 2. TẠO BẢN GHI THEO DÕI MỚI
        // Tạo một đối tượng Tracking mới để lưu vào database
        Tracking tracking = new Tracking();
        
        // Sao chép thông tin từ TrackingDTO (dữ liệu từ frontend) vào đối tượng Tracking
        tracking.setDate(trackingDTO.getDate());                    // Ngày xảy ra sự kiện
        tracking.setTime(trackingDTO.getTime());                    // Thời gian xảy ra sự kiện
        tracking.setLocation(trackingDTO.getLocation());            // Địa điểm xảy ra sự kiện
        tracking.setTrigger_value(trackingDTO.getTrigger());        // Nguyên nhân gây ra sự kiện (stress, habit, ...)
        tracking.setSatisfaction(trackingDTO.getSatisfaction());    // Mức độ hài lòng hoặc cường độ thèm thuốc
        tracking.setType(trackingDTO.getType());                    // Loại sự kiện (smoking, craving)
        tracking.setNotes(trackingDTO.getNotes());                  // Ghi chú của người dùng
        tracking.setUser(userOptional.get());                       // Liên kết với người dùng

        // 3. LƯU VÀO DATABASE
        // Lưu đối tượng tracking vào database và nhận lại đối tượng đã được lưu (có ID mới)
        Tracking savedTracking = trackingRepo.save(tracking);
        
        // 4. THÔNG BÁO SỰ KIỆN
        // Gửi thông báo cho hệ thống rằng có dữ liệu mới được thêm vào
        // Điều này có thể kích hoạt việc cập nhật dashboard, thống kê, v.v.
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.valueOf(trackingDTO.getUserId())));
        
        // 5. TRẢ VỀ KẾT QUẢ
        // Chuyển đối tượng tracking đã lưu thành DTO để trả về cho frontend
        // Kèm theo mã trạng thái 201 Created để báo hiệu tạo thành công
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedTracking));
    }

    // API này dùng để lấy tất cả dữ liệu theo dõi của một người dùng cụ thể. 
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTrackingByUserId(@PathVariable String userId) {
        try {
            // 1. CHUYỂN ĐỔI VÀ KIỂM TRA USERID
            // Chuyển đổi userId từ String sang int. Nếu userId là null thì gán bằng 0
            int id = userId != null ? Integer.parseInt(userId) : 0;
            
            // 2. TÌM KIẾM DỮ LIỆU TRONG DATABASE
            // Sử dụng TrackingRepo để tìm tất cả bản ghi tracking của người dùng này
            List<Tracking> trackings = trackingRepo.findByUserId(id);
            
            // 3. KIỂM TRA KẾT QUẢ
            // Nếu không tìm thấy dữ liệu nào, trả về lỗi 404 Not Found
            if (trackings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tracking data found for this user.");
            }
            
            // 4. CHUYỂN ĐỔI DỮ LIỆU
            // Chuyển đổi danh sách Tracking thành danh sách TrackingDTO để trả về cho frontend
            // DTO (Data Transfer Object) chỉ chứa những thông tin cần thiết, bảo mật hơn
            List<TrackingDTO> trackingDTOs = trackings.stream().map(this::toDTO).collect(Collectors.toList());
            
            // 5. TRẢ VỀ KẾT QUẢ THÀNH CÔNG
            // Trả về danh sách TrackingDTO với mã trạng thái 200 OK
            return ResponseEntity.ok(trackingDTOs);
            
        } catch (NumberFormatException e) {
            // Nếu userId không thể chuyển đổi thành số (ví dụ: userId = "abc"), trả về lỗi 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        }
    }

    
    //   Phương thức tiện ích để chuyển đổi đối tượng Tracking thành TrackingDTO.
    //   
    //   Tại sao cần chuyển đổi?
    //   - Tracking là đối tượng "nặng" chứa nhiều thông tin, bao gồm cả liên kết với đối tượng User.
    //   - TrackingDTO là đối tượng "nhẹ" chỉ chứa những thông tin cần thiết để gửi cho frontend.
    //   - Việc này giúp tiết kiệm băng thông mạng và bảo mật thông tin.
    
    private TrackingDTO toDTO(Tracking tracking) {
        // Tạo đối tượng TrackingDTO mới
        TrackingDTO dto = new TrackingDTO();
        
        // Sao chép thông tin từ Tracking sang TrackingDTO
        dto.setDate(tracking.getDate());                          // Ngày xảy ra sự kiện
        dto.setTime(tracking.getTime());                          // Thời gian xảy ra sự kiện
        dto.setLocation(tracking.getLocation());                  // Địa điểm xảy ra sự kiện
        dto.setTrigger(tracking.getTrigger_value());              // Nguyên nhân gây ra sự kiện
        dto.setSatisfaction(tracking.getSatisfaction());          // Mức độ hài lòng hoặc cường độ thèm thuốc
        dto.setType(tracking.getType());                          // Loại sự kiện (smoking, craving)
        dto.setNotes(tracking.getNotes());                        // Ghi chú của người dùng
        
        // Kiểm tra xem tracking có liên kết với user hay không
        if (tracking.getUser() != null) {
            // Nếu có, lấy ID của user và chuyển thành String để đưa vào DTO
            dto.setUserId(String.valueOf(tracking.getUser().getId()));
        }
        
        // Trả về đối tượng DTO đã hoàn chỉnh
        return dto;
    }
}
