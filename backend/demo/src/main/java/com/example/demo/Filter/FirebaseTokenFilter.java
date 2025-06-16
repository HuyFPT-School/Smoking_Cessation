package com.example.demo.Filter;

import com.example.demo.Repo.UserRepo;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;

@Component
public class FirebaseTokenFilter extends OncePerRequestFilter {

    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = decodedToken.getEmail();
                String name = decodedToken.getName();
                String picture = decodedToken.getPicture();

                // Tìm user trong database
                User user = userRepo.findByEmail(email);                
                
                if (user == null) {
                    // ✅ SỬA: Tạo user mới - loại bỏ text lạ
                    user = new User();
                    user.setEmail(email);
                    
                    // Xử lý tên an toàn
                    String userName = (name != null && !name.trim().isEmpty()) ? name.trim() : "User";
                    user.setName(userName);
                    
                    // Xử lý avatar
                    if (picture != null && !picture.isBlank()) {
                        user.setAvatarUrl(picture);
                    } else {
                        String diceBearAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + userName;
                        user.setAvatarUrl(diceBearAvatar);
                    }
                    
                    user.setPassword(null);
                    user.setRole(Role.USER);
                    user.setCreateAt(LocalDateTime.now());
                    
                    // ✅ THÊM: Exception handling cho save operation
                    try {
                        user = userRepo.save(user);
                    } catch (Exception saveException) {
                        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                            "Failed to create user account");
                        return;
                    }
                    
                } else {
                    // ✅ SỬA: Cập nhật user existing
                    boolean needUpdate = false;
                    
                    // Cập nhật avatar từ Firebase nếu có
                    if (picture != null && !picture.isBlank() && !picture.equals(user.getAvatarUrl())) {
                        user.setAvatarUrl(picture);
                        needUpdate = true;
                    } else if ((picture == null || picture.isBlank()) && 
                              (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
                        // ✅ SỬA: Dùng user.getName() thay vì name từ token
                        String diceBearAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + user.getName();
                        user.setAvatarUrl(diceBearAvatar);
                        needUpdate = true;
                    }
                    
                    if (needUpdate) {
                        try {
                            userRepo.save(user);
                        } catch (Exception updateException) {
                            // Log error nhưng không dừng flow
                            // Tiếp tục với user cũ
                        }
                    }
                }

                // Tạo authentication context
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (FirebaseAuthException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase ID Token");
                return;
            } catch (Exception e) {
                // ✅ THÊM: Exception handling tổng quát
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Authentication error");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}