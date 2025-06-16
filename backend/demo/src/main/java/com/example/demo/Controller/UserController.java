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
            String idToken = authHeader.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();
            
            // ✅ LẤY USER ĐÃ ĐƯỢC TẠO BỞI FIREBASETOKENFILTER
            User user = userRepo.findByEmail(email);
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "User not found"));
            }
            
            // ✅ CHỈ UPDATE NAME NẾU CÓ TRONG REQUEST BODY
            String nameFromBody = (body != null && body.get("name") != null) ? body.get("name").trim() : null;
            
            if (nameFromBody != null && !nameFromBody.equals(user.getName())) {
                user.setName(nameFromBody);
                
                // UPDATE AVATAR NẾU ĐANG DÙNG DICEBEAR
                if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("dicebear.com")) {
                    String newAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + nameFromBody;
                    user.setAvatarUrl(newAvatar);
                }
                
                user = userRepo.save(user);
            }
            
            return ResponseEntity.ok(user);

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Firebase ID token"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Server error: " + e.getMessage()));
        }
    }

}
