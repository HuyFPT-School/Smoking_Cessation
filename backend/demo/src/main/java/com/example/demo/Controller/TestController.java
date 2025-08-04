package com.example.demo.Controller;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @GetMapping("/firebase")
    public ResponseEntity<Map<String, Object>> testFirebase() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            FirebaseAuth auth = FirebaseAuth.getInstance();
            String projectId = auth.getApp().getOptions().getProjectId();
            
            response.put("status", "success");
            response.put("message", "Firebase đã được khởi tạo thành công!");
            response.put("projectId", projectId);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Lỗi Firebase: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    @PostMapping("/verify-token")
    public ResponseEntity<Map<String, Object>> verifyToken(@RequestHeader("Authorization") String token) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Bỏ "Bearer " prefix
            String idToken = token.replace("Bearer ", "");
            
            // Verify token
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            
            response.put("status", "success");
            response.put("message", "Token hợp lệ!");
            response.put("uid", uid);
            response.put("email", email);
            response.put("name", name);
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Token không hợp lệ: " + e.getMessage());
            response.put("timestamp", System.currentTimeMillis());
            
            return ResponseEntity.status(401).body(response);
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "healthy");
        response.put("message", "Backend đang hoạt động bình thường");
        response.put("timestamp", System.currentTimeMillis());
        response.put("branch", "huy");
        
        return ResponseEntity.ok(response);
    }
}
