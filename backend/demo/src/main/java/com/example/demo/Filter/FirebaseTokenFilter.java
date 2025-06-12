
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

                // Tìm user, nếu chưa có thì tạo mới
                User user = userRepo.findByEmail(email);                
                if (user == null) {
                    user = new User();
                    user.setEmail(email);
                    String userName = name != null ? name : "Anonymous User";
                    user.setName(userName);
                    
                    // ✅ SỬA: Logic chọn avatar
                    if (picture != null && !picture.isBlank()) {
                        // Có avatar từ Google/Firebase → dùng avatar đó
                        user.setAvatarUrl(picture);
                    } else {
                        // Không có avatar từ Google → dùng DiceBear
                        String diceBearAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + userName;
                        user.setAvatarUrl(diceBearAvatar);
                    }
                    
                    user.setPassword(null);
                    user.setRole(Role.USER);
                    user.setCreateAt(LocalDateTime.now());
                    user = userRepo.save(user);
                } else {
                    // ✅ THÊM: Cập nhật avatar nếu user link với Google
                    if (picture != null && !picture.equals(user.getAvatarUrl())) {
                        user.setAvatarUrl(picture);
                        userRepo.save(user);
                    }
                }

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (FirebaseAuthException e) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid Firebase ID Token");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
