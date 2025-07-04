package com.example.demo.Controller;

import com.example.demo.DTO.AdminDTO;
import com.example.demo.DTO.AdminUserDTO;
import com.example.demo.DTO.UserProfileDTO;
import com.example.demo.service.AdminServicePackage.dashboard.AdminDashboardService;
import com.example.demo.service.AdminServicePackage.user.AdminRemoteService;
import com.example.demo.service.AdminServicePackage.user.AdminUserService;
import com.example.demo.service.AdminServicePackage.content.AdminCommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin                             // Cho phép frontend ở domain khác (vd: React chạy ở http://localhost:3000) gọi API này
@RestController                          // Controller kiểu RESTful, tự động trả JSON thay vì HTML
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    @Autowired
    private  AdminCommunityService adminCommunityService;

    @Autowired
    private AdminDashboardService dashboardService;

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private AdminRemoteService adminRemoteService;


    // ==================== DASHBOARD ====================

    // ✅ Lấy dữ liệu tổng quan dashboard (số user, admin, v.v...)
    // 📌 Dùng chung cho cả ADMIN và SUPER_ADMIN
    @GetMapping("/dashboard")
    public AdminDTO getDashboardData() {
        return dashboardService.getTotalUserStats();
    }

    // ==================== QUẢN LÝ USER ====================

    // ✅ Trả về danh sách user thường (trong phần users của trang admin)
    // 📌 Cả ADMIN và SUPER_ADMIN đều xem được
    @GetMapping("/users")
    public List<AdminUserDTO> getUsersForAdmin(@RequestParam int currentAdminId) {
        return adminUserService.getAllUsersVisibleToAdmin(currentAdminId);
    }

    // ✅ Trả về danh sách các admin hiện tại (chỉ SUPER_ADMIN xem)
    @GetMapping("/admins")
    public List<AdminUserDTO> getAllAdmins(@RequestParam int currentAdminId) {
        return adminUserService.getAllAdmins(currentAdminId);
    }

    // ✅ Lấy chi tiết profile
    // 📌 Dùng cho modal xem chi tiết hồ sơ trong giao diện admin
    @GetMapping("/user/{id}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Integer id) {
        UserProfileDTO dto = adminUserService.getUserProfileByUserId(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();  // Trả về 404 nếu không tìm thấy user
        }
        return ResponseEntity.ok(dto);
    }

    // ✅ Xóa 1 user thường
    // 📌 Chỉ ADMIN hoặc SUPER_ADMIN mới được thực hiện
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId,
                                        @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.deleteUserByAdmin(userId, currentAdminId);
        return success
                ? ResponseEntity.ok("User deleted successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }

    // ==================== QUẢN LÝ PHÂN QUYỀN ====================

    // ✅ Nâng quyền user thường thành admin
    // 📌 Chỉ SUPER_ADMIN mới được phép thực hiện hành động này
    @PutMapping("/promote/{userId}")
    public ResponseEntity<?> promoteUserToAdmin(@PathVariable String userId,
                                                @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.promoteToAdmin(userId, currentAdminId);
        return success
                ? ResponseEntity.ok("Promoted to ADMIN successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }

    // ✅ Giáng cấp admin thành user thường
    // 📌 Chỉ SUPER_ADMIN mới được phép thực hiện hành động này
    @PutMapping("/demote/{adminId}")
    public ResponseEntity<?> demoteAdmin(@PathVariable String adminId,
                                         @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.demoteAdminToUser(adminId, currentAdminId);
        return success
                ? ResponseEntity.ok("Admin demoted to USER successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }

    // ==================== QUẢN LÝ COMMUNITY (BLOG, COMMENT) ====================

    /**
     * ✅ Xóa bài viết bất kỳ
     * 📌 Chỉ ADMIN hoặc SUPER_ADMIN có quyền
     * 🔗 Endpoint ví dụ: DELETE /api/admin/posts/delete/45?adminId=2
     */
    @DeleteMapping("/posts/delete/{postId}")
    public ResponseEntity<?> deletePostByAdmin(@PathVariable Integer postId,
                                               @RequestParam Integer adminId) {
        return adminCommunityService.deletePostByAdmin(postId, adminId);
    }

    /**
     * ✅ Xóa bình luận bất kỳ
     * 📌 Chỉ ADMIN hoặc SUPER_ADMIN có quyền
     * 🔗 Endpoint ví dụ: DELETE /api/admin/comments/delete/12?adminId=2
     */
    @DeleteMapping("/comments/delete/{commentId}")
    public ResponseEntity<?> deleteCommentByAdmin(@PathVariable Integer commentId,
                                                  @RequestParam Integer adminId) {
        return adminCommunityService.deleteCommentByAdmin(commentId, adminId);
    }
}
