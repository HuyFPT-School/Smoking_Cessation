package com.example.demo.Controller;

import com.example.demo.Repo.UserRepo;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/api/user")
public class UserController {

    // Đây là một thuộc tính để tương tác với bảng trong cơ sở dữ liệu.
    @Autowired
    private UserRepo userRepo;

    //authentication: Tham số này được Spring Security tự động cung cấp, chứa thông tin xác thực của người dùng đã đăng nhập thành công.
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // Lấy đối tượng User từ thông tin xác thực. Spring Security đã lưu nó ở đó sau khi đăng nhập.
        User user = (User) authentication.getPrincipal();
        // Trả về đối tượng user và mã 200 OK.
        return ResponseEntity.ok(user);
    }
    
    // Nếu có thông tin 'name' mới được gửi lên, nó sẽ cập nhật lại tên và avatar của người dùng.
    // Phương thức này hoạt động song song với FirebaseTokenFilter. Filter sẽ tạo người dùng nếu chưa có, còn phương thức này sẽ lấy và có thể cập nhật.
    // authHeader: Lấy giá trị từ header "Authorization" của yêu cầu. Đây là nơi chứa "vé" (token) của Firebase.
    //                   Ví dụ: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im..."
    // body: (Không bắt buộc) Lấy nội dung (body) của yêu cầu. Dùng để nhận tên mới nếu người dùng muốn cập nhật.
    //              Ví dụ: { "name": "Tên Mới" }

    @PostMapping("/me")
    public ResponseEntity<?> getOrCreateUser(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody(required = false) Map<String, String> body) {
        try {
            // 1. XÁC THỰC TOKEN TỪ FIREBASE
            // Tách chữ "Bearer " ra khỏi header để lấy token thực sự.
            String idToken = authHeader.replace("Bearer ", "");
            // Gọi đến Firebase để xác thực token này. Nếu token hợp lệ, ta sẽ nhận lại thông tin đã được giải mã.
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            // Lấy email từ token đã giải mã. Email là thông tin định danh duy nhất.
            String email = decodedToken.getEmail();
            
            // 2. TÌM NGƯỜI DÙNG TRONG DATABASE
            // Sử dụng UserRepo để tìm người dùng trong database bằng email.
            // Lưu ý: Tại thời điểm này, người dùng thường đã được tạo bởi FirebaseTokenFilter.
            User user = userRepo.findByEmail(email);
            
            // Nếu vì lý do nào đó không tìm thấy người dùng (dù đã qua filter), trả về lỗi.
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND) // Mã lỗi 404
                        .body(Map.of("message", "User not found")); // Kèm thông báo
            }
            
            // 3. CẬP NHẬT THÔNG TIN (NẾU CÓ)
            // Kiểm tra xem trong body của request có gửi lên "name" hay không.
            String nameFromBody = (body != null && body.get("name") != null) ? body.get("name").trim() : null;
            
            // Nếu có tên mới và tên đó khác với tên hiện tại trong database.
            if (nameFromBody != null && !nameFromBody.equals(user.getName())) {
                // Cập nhật tên mới cho đối tượng user.
                user.setName(nameFromBody);
                
                // Nếu avatar hiện tại là avatar mặc định từ DiceBear, tạo avatar mới dựa trên tên mới.
                if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("dicebear.com")) {
                    String newAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + nameFromBody;
                    user.setAvatarUrl(newAvatar);
                }
                
                // Lưu lại đối tượng user đã được cập nhật vào database.
                user = userRepo.save(user);
            }
            
            // 4. TRẢ VỀ KẾT QUẢ THÀNH CÔNG
            // Trả về thông tin người dùng (mới nhất) và mã 200 OK.
            return ResponseEntity.ok(user);

        } catch (FirebaseAuthException e) {
            // Nếu token không hợp lệ, Firebase sẽ ném ra lỗi này.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED) // Mã lỗi 401
                    .body(Map.of("message", "Invalid Firebase ID token")); // Kèm thông báo
        } catch (Exception e) {
            // Bắt các lỗi chung khác có thể xảy ra (ví dụ: lỗi kết nối database).
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR) // Mã lỗi 500
                    .body(Map.of("message", "Server error: " + e.getMessage())); // Kèm thông báo lỗi
        }
    }

}
