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

    @Autowired
    private UserRepo userRepo;

    

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PostMapping("/me")
    public ResponseEntity<?> getOrCreateUser(@RequestHeader("Authorization") String authHeader,
                                             @RequestBody(required = false) Map<String, String> body) {
        try {
            // Trích xuất token từ header bằng cách loại bỏ phần "Bearer "
            String idToken = authHeader.replace("Bearer ", "");
            // Xác thực token với Firebase Authentication
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

            // Lấy thông tin từ Firebase token
            String email = decodedToken.getEmail();
            String firebasePhotoUrl = decodedToken.getPicture(); // ✅ THÊM
            String nameFromToken = decodedToken.getName(); // ✅ THÊM
            String nameFromBody = (body != null && body.get("name") != null) ? body.get("name").trim() : null;
            
            // ✅ SỬA: Logic tên đúng
            String finalName;
            if (nameFromBody != null && !nameFromBody.isBlank()) {
                finalName = nameFromBody;
            } else if (nameFromToken != null && !nameFromToken.isBlank()) {
                finalName = nameFromToken;
            } else {
                finalName = "Anonymous User";
            }

            // Tìm người dùng trong cơ sở dữ liệu theo email
            User user = userRepo.findByEmail(email);
            // Nếu người dùng chưa tồn tại trong hệ thống, tạo mới
            if (user == null) {
                user = new User();
                user.setEmail(email);  // Đặt email từ Firebase
                user.setName(finalName);  // Đặt tên người dùng
                user.setPassword(null);  // Không cần mật khẩu vì xác thực qua Firebase
                user.setRole(Role.USER);  // Đặt vai trò mặc định là USER
                user.setCreateAt(LocalDateTime.now());  // Đặt thời điểm tạo tài khoản
                
                // ✅ SỬA: Logic avatar giống FirebaseTokenFilter
                if (firebasePhotoUrl != null && !firebasePhotoUrl.isBlank()) {
                    // Có avatar từ Google/Firebase → dùng avatar đó
                    user.setAvatarUrl(firebasePhotoUrl);
                } else {
                    // Không có avatar từ Google → dùng DiceBear
                    String diceBearAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + finalName;
                    user.setAvatarUrl(diceBearAvatar);
                }
                
                userRepo.save(user);  // Lưu người dùng mới vào cơ sở dữ liệu
            } else {
                // ✅ THÊM: Cập nhật thông tin nếu cần
                boolean needUpdate = false;
                
                // Cập nhật tên nếu có tên mới từ body
                if (nameFromBody != null && !nameFromBody.equals(user.getName())) {
                    user.setName(nameFromBody);
                    needUpdate = true;
                }
                
                // Cập nhật avatar khi link với Google
                if (firebasePhotoUrl != null && !firebasePhotoUrl.isBlank() && 
                    !firebasePhotoUrl.equals(user.getAvatarUrl())) {
                    user.setAvatarUrl(firebasePhotoUrl);
                    needUpdate = true;
                }
                
                if (needUpdate) {
                    userRepo.save(user);
                }
            }

            // Trả về thông báo thành công và thông tin người dùng
            return ResponseEntity.ok(Map.of("message", "Login Success", "user", user));

        } catch (FirebaseAuthException e) {
            // Xử lý ngoại lệ khi token không hợp lệ
            // Trả về lỗi 401 Unauthorized và thông báo lỗi
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Firebase ID token"));
        }
    }



}
