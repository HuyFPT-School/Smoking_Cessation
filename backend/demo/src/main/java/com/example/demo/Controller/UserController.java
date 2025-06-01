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

    @PostMapping("/google-auth")
    public ResponseEntity<?> authenticateWithGoogle(@RequestHeader("Authorization") String authHeader) {
        try {
            String idToken = authHeader.replace("Bearer ", "");
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);

            String email = decodedToken.getEmail();
            String name = decodedToken.getName();
            String picture = decodedToken.getPicture();

            User user = userRepo.findByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(Map.of(
                        "message", "Login Success",
                        "user", user
                ));
            }

            // Tạo mới user Google
            user = new User();
            user.setEmail(email);
            user.setName(name != null ? name : "Google User");
            user.setPassword(null);
            user.setRole(com.example.demo.entity.Role.USER);
            user.setCreateAt(LocalDateTime.now());
            user.setAvatarUrl(picture);

            User savedUser = userRepo.save(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Register Success",
                    "user", savedUser
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Firebase ID token"));
        }
    }

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
            String nameFromBody = (body != null && body.get("name") != null) ? body.get("name").trim() : null;
            String finalName = (nameFromBody != null && !nameFromBody.isBlank()) ? nameFromBody : "No Name";
            String avatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + finalName;

            User user = userRepo.findByEmail(email);
            if (user == null) {
                user = new User();
                user.setEmail(email);
                user.setName(finalName);
                user.setPassword(null);
                user.setRole(Role.USER);
                user.setAvatarUrl(avatar);
                user.setCreateAt(LocalDateTime.now());
                userRepo.save(user);
            }

            return ResponseEntity.ok(Map.of("message", "Login Success", "user", user));

        } catch (FirebaseAuthException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Firebase ID token"));
        }
    }



}
