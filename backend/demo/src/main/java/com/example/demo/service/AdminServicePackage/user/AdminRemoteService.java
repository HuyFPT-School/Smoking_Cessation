package com.example.demo.service.AdminServicePackage.user;


import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;

import com.example.demo.Repo.*;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;


@Service
public class AdminRemoteService {

    @Autowired private UserRepo userRepo;
    @Autowired private UserProfileRepo userProfileRepo;
    @Autowired private PlanRepo planRepo;
    @Autowired private CommentRepo commentRepo;
    @Autowired private PostLikeRepo postLikeRepo;
    @Autowired private TrackingRepo trackingRepo;
    @Autowired private DashboardRepo dashboardRepo;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private PostRepo postRepo;

    // =====================================================================================
    // ✅ 1. SUPER_ADMIN promote USER → ADMIN
    // =====================================================================================
    public boolean promoteToAdmin(String userIdStr, String currentAdminIdStr) {
        Integer userId = parse(userIdStr);
        Integer currentAdminId = parse(currentAdminIdStr);

        User current = userRepo.findById(currentAdminId).orElseThrow();  // Người thực hiện
        User target = userRepo.findById(userId).orElseThrow();          // Người bị promote

        // Chỉ SUPER_ADMIN được phép promote
        if (current.getRole() != Role.SUPER_ADMIN || target.getRole() != Role.USER)
            return false;

        target.setRole(Role.ADMIN);
        userRepo.save(target);
        return true;
    }

    // =====================================================================================
    // ✅ 2. SUPER_ADMIN demote ADMIN → USER
    // =====================================================================================
    public boolean demoteAdminToUser(String adminIdStr, String currentAdminIdStr) {
        Integer adminId = parse(adminIdStr);
        Integer currentAdminId = parse(currentAdminIdStr);

        User current = userRepo.findById(currentAdminId).orElseThrow();
        User target = userRepo.findById(adminId).orElseThrow();

        // Chỉ SUPER_ADMIN mới có quyền hạ cấp ADMIN
        if (current.getRole() == Role.SUPER_ADMIN && target.getRole() == Role.ADMIN) {
            target.setRole(Role.USER);
            userRepo.save(target);
            return true;
        }

        return false;
    }

    // =====================================================================================
    // ✅ 3. ADMIN hoặc SUPER_ADMIN xóa USER
    // =====================================================================================
    @Transactional
    public boolean deleteUserByAdmin(String targetUserId, String currentAdminId) {
        int targetId = Integer.parseInt(targetUserId);
        int adminId = Integer.parseInt(currentAdminId);

        if (targetId == adminId) return false; // Không cho tự xóa chính mình

        Optional<User> currentOpt = userRepo.findById(adminId);
        Optional<User> targetOpt = userRepo.findById(targetId);

        if (currentOpt.isEmpty() || targetOpt.isEmpty()) return false;

        User current = currentOpt.get();
        User target = targetOpt.get();

        Role currentRole = current.getRole();
        Role targetRole = target.getRole();

        // ❌ Không cho xóa SUPER_ADMIN
        if (targetRole == Role.SUPER_ADMIN) return false;

        // ✅ SUPER_ADMIN được xóa mọi user (trừ chính mình)
        if (currentRole == Role.SUPER_ADMIN) {
            return deleteUserAndFirebase(target, targetId);
        }

        // ✅ ADMIN chỉ được xóa người dùng thường (USER)
        if (currentRole == Role.ADMIN && targetRole == Role.USER) {
            return deleteUserAndFirebase(target, targetId);
        }

        return false;
    }

    // =====================================================================================
    // ✅ XÓA HOÀN TOÀN USER: FIREBASE + DATABASE
    // =====================================================================================
    private boolean deleteUserAndFirebase(User target, int targetId) {
        System.out.println("🔍 Attempting to delete user:");
        System.out.println("  - Database ID: " + target.getId());
        System.out.println("  - Email: " + target.getEmail());
        System.out.println("  - UID: " + target.getUid());

        // --- 1. XÓA TRÊN FIREBASE ---
        boolean firebaseDeleted = false;
        if (target.getUid() != null && !target.getUid().isBlank()) {
            try {
                FirebaseAuth.getInstance().deleteUser(target.getUid());
                System.out.println("✅ Firebase user deleted successfully: " + target.getUid());
                firebaseDeleted = true;
            } catch (FirebaseAuthException e) {
                System.err.println("❌ Firebase deletion failed: " + e.getMessage());
                // ⚠️ Không dừng tại đây, vẫn tiếp tục xóa database
            }
        }

        // --- 2. XÓA DATABASE ---
        try {
            commentRepo.deleteByUser(target);                         // Xóa comment
            postLikeRepo.deleteByUser(target);                        // Xóa like
            trackingRepo.deleteByUser(target);                        // Xóa tracking
            dashboardRepo.deleteByUserId(targetId);                   // Xóa dashboard
            chatMessageRepository.deleteByUserId((long) targetId);    // Xóa chat
            planRepo.deleteByUserId(String.valueOf(targetId));        // Xóa kế hoạch cai thuốc
            userProfileRepo.deleteByUser(target);                     // Xóa hồ sơ
            postRepo.deleteByUser(target);                            // Xóa bài viết
            userRepo.delete(target);                                  // Xóa user chính

            System.out.println("✅ Database records deleted successfully");

            if (firebaseDeleted) {
                System.out.println("🎉 User completely removed from both Database and Firebase!");
            } else {
                System.out.println("⚠️ User removed from Database, but Firebase deletion failed.");
            }

            return true;
        } catch (Exception e) {
            System.err.println("❌ Database deletion failed: " + e.getMessage());
            return false;
        }
    }

    // =====================================================================================
    // ✅ Hàm tiện ích: Parse chuỗi sang số nguyên, dùng để validate ID
    // =====================================================================================
    private Integer parse(String str) {
        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID format");
        }
    }
}

