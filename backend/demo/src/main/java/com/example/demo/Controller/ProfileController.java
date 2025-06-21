package com.example.demo.Controller;

import com.example.demo.DTO.UserProfileDTO;
import com.example.demo.entity.User;
import com.example.demo.entity.UserProfile;
import com.example.demo.Repo.UserProfileRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile") // Xác định đường dẫn gốc cho tất cả các API trong lớp này. Mọi yêu cầu sẽ bắt đầu bằng "/api/profile".
@CrossOrigin
public class ProfileController {

    // Đây là một thuộc tính để tương tác với bảng 'user_profile' trong cơ sở dữ liệu.
    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private UserRepo userRepo;

    // API này dùng để lấy thông tin hồ sơ của một người dùng cụ thể.
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable String userId) {
        try {
            // 1. CHUYỂN ĐỔI VÀ KIỂM TRA USERID
            // Chuyển đổi userId từ String sang int. Nếu userId là null thì gán bằng 0
            int id = userId != null ? Integer.parseInt(userId) : 0;
            
            // 2. TÌM KIẾM HỒ SƠ TRONG DATABASE
            // Sử dụng UserProfileRepo để tìm hồ sơ của người dùng này
            // Optional là một "hộp" có thể chứa dữ liệu hoặc rỗng, giúp tránh lỗi null
            Optional<UserProfile> userProfileOptional = userProfileRepo.findByUserId(id);

            // 3. KIỂM TRA KẾT QUẢ
            // Nếu không tìm thấy hồ sơ nào, trả về lỗi 404 Not Found
            if (userProfileOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No profile found for this user.");
            }

            // 4. CHUYỂN ĐỔI DỮ LIỆU VÀ TRẢ VỀ
            // Chuyển đổi UserProfile thành UserProfileDTO để trả về cho frontend
            // DTO (Data Transfer Object) chỉ chứa những thông tin cần thiết, bảo mật hơn
            UserProfileDTO profileDTO = toDTO(userProfileOptional.get());
            return ResponseEntity.ok(profileDTO);
            
        } catch (NumberFormatException e) {
            // Nếu userId không thể chuyển đổi thành số (ví dụ: userId = "abc"), trả về lỗi 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        }
    }

    // API này dùng để tạo mới hoặc cập nhật thông tin hồ sơ người dùng.
    @PostMapping
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody UserProfileDTO profileDTO) {
        try {
            // 1. KIỂM TRA NGƯỜI DÙNG CÓ TỒN TẠI KHÔNG
            Integer userId = profileDTO.getUserId();
            
            // Tìm người dùng trong database dựa trên userId
            Optional<User> userOptional = userRepo.findById(userId);

            // Nếu không tìm thấy người dùng, trả về lỗi 400 Bad Request
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            User user = userOptional.get();

            // 2. CẬP NHẬT TÊN NGƯỜI DÙNG (NẾU CÓ)
            // Kiểm tra xem có tên mới được gửi lên không
            if (profileDTO.getName() != null && !profileDTO.getName().trim().isEmpty()) {
                // Cập nhật tên trong bảng user
                user.setName(profileDTO.getName());
                userRepo.save(user);
            }

            // 3. KIỂM TRA HỒ SƠ ĐÃ TỒN TẠI CHƯA
            // Tìm xem người dùng này đã có hồ sơ trong database chưa
            Optional<UserProfile> existingProfileOptional = userProfileRepo.findByUserId(userId);
            UserProfile userProfile;

            if (existingProfileOptional.isPresent()) {
                // 4A. CẬP NHẬT HỒ SƠ HIỆN TẠI
                // Nếu đã có hồ sơ, lấy hồ sơ hiện tại để cập nhật
                userProfile = existingProfileOptional.get();
            } else {
                // 4B. TẠO HỒ SƠ MỚI
                // Nếu chưa có hồ sơ, tạo một đối tượng UserProfile mới
                userProfile = new UserProfile();
                userProfile.setUser(user); // Liên kết hồ sơ với người dùng
            }

            // 5. CẬP NHẬT CÁC THÔNG TIN HỒ SƠ
            // Sao chép tất cả thông tin từ DTO vào đối tượng UserProfile
            userProfile.setPhone(profileDTO.getPhone());                    // Số điện thoại
            userProfile.setBirthdate(profileDTO.getBirthdate());            // Ngày sinh
            userProfile.setGender(profileDTO.getGender());                  // Giới tính
            userProfile.setBio(profileDTO.getBio());                        // Tiểu sử/Mô tả bản thân
            userProfile.setSmokingAge(profileDTO.getSmokingAge());          // Tuổi bắt đầu hút thuốc
            userProfile.setYearsSmoked(profileDTO.getYearsSmoked());        // Số năm đã hút thuốc
            userProfile.setOccupation(profileDTO.getOccupation());          // Nghề nghiệp
            userProfile.setHealthStatus(profileDTO.getHealthStatus());      // Tình trạng sức khỏe

            // 6. LƯU VÀO DATABASE VÀ TRẢ VỀ KẾT QUẢ
            // Lưu hồ sơ vào database
            UserProfile savedProfile = userProfileRepo.save(userProfile);
            
            // Chuyển đổi hồ sơ đã lưu thành DTO và trả về cho frontend với mã 200 OK
            return ResponseEntity.ok(toDTO(savedProfile));

        } catch (NumberFormatException e) {
            // Nếu userId không thể chuyển đổi thành số, trả về lỗi 400 Bad Request
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        } catch (Exception e) {
            // Nếu có lỗi chung khác xảy ra (ví dụ: lỗi database), trả về lỗi 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving profile: " + e.getMessage());
        }
    }


    //   Phương thức tiện ích để chuyển đổi đối tượng UserProfile thành UserProfileDTO.
    //   
    //   Tại sao cần chuyển đổi?
    //   - UserProfile là đối tượng "nặng" chứa nhiều thông tin, bao gồm cả liên kết với đối tượng User.
    //   - UserProfileDTO là đối tượng "nhẹ" chỉ chứa những thông tin cần thiết để gửi cho frontend.
    //   - Việc này giúp tiết kiệm băng thông mạng và bảo mật thông tin.
    
    private UserProfileDTO toDTO(UserProfile userProfile) {
        // Tạo đối tượng UserProfileDTO mới
        UserProfileDTO dto = new UserProfileDTO();
        
        // Sao chép thông tin từ UserProfile sang UserProfileDTO
        dto.setName(userProfile.getUser().getName());                     // Tên người dùng (lấy từ đối tượng User liên kết)
        dto.setPhone(userProfile.getPhone());                             // Số điện thoại
        dto.setBirthdate(userProfile.getBirthdate());                     // Ngày sinh
        dto.setGender(userProfile.getGender());                           // Giới tính
        dto.setBio(userProfile.getBio());                                 // Tiểu sử/Mô tả bản thân
        dto.setSmokingAge(userProfile.getSmokingAge());                   // Tuổi bắt đầu hút thuốc
        dto.setYearsSmoked(userProfile.getYearsSmoked());                 // Số năm đã hút thuốc
        dto.setOccupation(userProfile.getOccupation());                   // Nghề nghiệp
        dto.setHealthStatus(userProfile.getHealthStatus());               // Tình trạng sức khỏe
        dto.setUserId(userProfile.getUser().getId());                     // ID người dùng 
        
        // Trả về đối tượng DTO đã hoàn chỉnh
        return dto;
    }
}
