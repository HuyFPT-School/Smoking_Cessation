package com.example.demo.Controller;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Backend is running! 🚀");
    }

    @GetMapping("/firebase")
    public ResponseEntity<String> testFirebase() {
        try {
            // Kiểm tra FirebaseApp có được khởi tạo không
            if (FirebaseApp.getApps().isEmpty()) {
                return ResponseEntity.ok("❌ Firebase chưa được khởi tạo");
            }
            
            // Lấy FirebaseApp default
            FirebaseApp app = FirebaseApp.getInstance();
            String projectId = app.getOptions().getProjectId();
            
            // Test FirebaseAuth
            FirebaseAuth auth = FirebaseAuth.getInstance();
            
            return ResponseEntity.ok("✅ Firebase hoạt động! Project ID: " + projectId);
            
        } catch (Exception e) {
            return ResponseEntity.ok("❌ Lỗi Firebase: " + e.getMessage());
        }
    }
    
    @PostMapping("/verify-token")
    public ResponseEntity<String> verifyToken(@RequestHeader("Authorization") String token) {
        try {
            // Bỏ "Bearer " prefix
            String idToken = token.replace("Bearer ", "");
            
            // Verify token
            var decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            
            return ResponseEntity.ok("✅ Token hợp lệ! UID: " + uid);
        } catch (Exception e) {
            return ResponseEntity.ok("❌ Token không hợp lệ: " + e.getMessage());
        }
    }
}