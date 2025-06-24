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

@Component // Báo cho hệ thống biết đây là một thành phần quan trọng
public class FirebaseTokenFilter extends OncePerRequestFilter {
    // Mỗi khi có người vào website, chỉ kiểm tra 1 lần
    @Autowired
    private UserRepo userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {
        // Lấy token từ header Authorization
        String authHeader = request.getHeader("Authorization");
        // Kiểm tra xem token có tồn tại và bắt đầu bằng "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String idToken = authHeader.substring(7);

            try {
                // Gọi Firebase để xác nhận vé có thật không
                FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
                String email = decodedToken.getEmail();
                String name = decodedToken.getName();
                String picture = decodedToken.getPicture();

                // Tìm user trong database
                User user = userRepo.findByEmail(email);                
                
                if (user == null) {
                    // Tạo user mới
                    user = new User();
                    user.setEmail(email);
                    
                    // Xử lý tên an toàn
                    String userName = (name != null && !name.trim().isEmpty()) ? name.trim() : "User";
                    user.setName(userName);
                    
                    // Xử lý avatar
                    // Nếu có ảnh từ Firebase, dùng nó, nếu không thì tạo avatar mặc định
                    if (picture != null && !picture.isBlank()) {
                        user.setAvatarUrl(picture);
                    } else {
                        String diceBearAvatar = "https://api.dicebear.com/7.x/initials/svg?seed=" + userName;
                        user.setAvatarUrl(diceBearAvatar);
                    }
                    
                    user.setPassword(null);
                    user.setUid(decodedToken.getUid()); // Lưu UID
                    user.setRole(Role.USER);
                    user.setCreateAt(LocalDateTime.now());
                    
                    // Nếu có lỗi khi lưu, trả về lỗi 500
                    try {
                        user = userRepo.save(user);
                    } catch (Exception saveException) {
                        response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                            "Failed to create user account");
                        return;
                    }
                    
                } else {
                    // Có cần cập nhật thông tin người dùng không?
                    boolean needUpdate = false;
                    
                    // Nếu ảnh từ Firebase khác ảnh trong hồ sơ → cập nhật
                    // Nếu ảnh từ Firebase không có và ảnh trong hồ sơ cũng không có → dùng ảnh mặc định từ tên người dùng
                    if (picture != null && !picture.isBlank() && !picture.equals(user.getAvatarUrl())) {
                        user.setAvatarUrl(picture);
                        needUpdate = true;
                    } else if ((picture == null || picture.isBlank()) && 
                              (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank())) {
                        // Dùng user.getName() thay vì name từ token
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
                // Sử dụng user đã được xác thực từ Firebase
                // Không cần mật khẩu vì đã xác thực bằng Firebase
                // Sử dụng Collections.emptyList() vì không cần quyền cụ thể
                // Tạo một đối tượng UsernamePasswordAuthenticationToken
                // để lưu thông tin người dùng đã xác thực
                // authentication: Tạo "thẻ tạm thời" để người dùng di chuyển trong website
                // SecurityContextHolder: "Máy quét thẻ" của hệ thống - ghi nhận người này đã được xác thực
                // SecurityContextHolder: Lưu trữ thông tin người dùng hiện tại trong suốt phiên làm việc
                // getContext(): Truy cập vào không gian lưu trữ thông tin xác thực
                // setAuthentication(authentication): Lưu thông tin "user này đã được xác thực" vào hệ thống
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
        // Tiếp tục chuỗi lọc
        filterChain.doFilter(request, response);
    }
}