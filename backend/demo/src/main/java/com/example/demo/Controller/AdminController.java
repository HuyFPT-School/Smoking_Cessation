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

@RestController
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


    // ✅ Dùng chung cho ADMIN và SUPER_ADMIN
    @GetMapping("/dashboard")
    public AdminDTO getDashboardData() {
        return dashboardService.getTotalUserStats();
    }

    // ✅ Cho cả ADMIN và SUPER_ADMIN xem danh sách user thường
    @GetMapping("/users")
    public List<AdminUserDTO> getUsersForAdmin(@RequestParam int currentAdminId) {
        return adminUserService.getAllUsersForAdmin(currentAdminId);
    }

    // ✅ Lấy danh sách user có role ADMIN
    @GetMapping("/admins")
    public List<AdminUserDTO> getAllAdmins(@RequestParam int currentAdminId) {
        return adminUserService.getAllAdmins(currentAdminId);
    }
    // SUPER_ADMIN lấy danh sách USER thường
    @GetMapping("/regular-users")
    public List<AdminUserDTO> getRegularUsers(@RequestParam int currentAdminId) {
        // Nếu muốn kiểm tra role ở đây cũng được
        return adminUserService.getAllRegularUsers();
    }



    // ✅ Chỉ SUPER_ADMIN có quyền promote
    @PutMapping("/promote/{userId}")
    public ResponseEntity<?> promoteUserToAdmin(@PathVariable String userId,
                                                @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.promoteToAdmin(userId, currentAdminId);
        return success
                ? ResponseEntity.ok("Promoted to ADMIN successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }
    // ✅ Chỉ SUPER_ADMIN có quyền demote
    @PutMapping("/demote/{adminId}")
    public ResponseEntity<?> demoteAdmin(@PathVariable String adminId,
                                         @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.demoteAdminToUser(adminId, currentAdminId);
        return success
                ? ResponseEntity.ok("Admin demoted to USER successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }


    // ✅ ADMIN phụ xóa user thường
    @DeleteMapping("/delete-user/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId,
                                        @RequestParam String currentAdminId) {
        boolean success = adminRemoteService.deleteUserByAdmin(userId, currentAdminId);
        return success
                ? ResponseEntity.ok("User deleted successfully")
                : ResponseEntity.badRequest().body("Permission denied or invalid target");
    }
    // ✅ ADMIN xem user thường
    @GetMapping("/user/{id}")
    public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Integer id) {
        UserProfileDTO dto = adminUserService.getUserProfileByUserId(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    /**
     * Xóa bài viết bất kỳ (chỉ cho ADMIN hoặc SUPER_ADMIN)
     * <p>
     * URL: DELETE /api/admin/posts/delete/{postId}?adminId=2
     */
    @DeleteMapping("/posts/delete/{postId}")
    public ResponseEntity<?> deletePostByAdmin(@PathVariable Integer postId,
                                               @RequestParam Integer adminId) {
        return adminCommunityService.deletePostByAdmin(postId, adminId);
    }

    /**
     * Xóa bình luận bất kỳ (chỉ cho ADMIN hoặc SUPER_ADMIN)
     * <p>
     * URL: DELETE /api/admin/comments/delete/{commentId}?adminId=2
     */
    @DeleteMapping("/comments/delete/{commentId}")
    public ResponseEntity<?> deleteCommentByAdmin(@PathVariable Integer commentId,
                                                  @RequestParam Integer adminId) {
        return adminCommunityService.deleteCommentByAdmin(commentId, adminId);
    }
}
