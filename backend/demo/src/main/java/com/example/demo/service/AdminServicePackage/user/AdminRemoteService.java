package com.example.demo.service.AdminServicePackage.user;



import com.example.demo.Repo.*;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminRemoteService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private PostLikeRepo postLikeRepo;

    @Autowired
    private TrackingRepo trackingRepo;

    @Autowired
    private DashboardRepo dashboardRepo;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // SUPER_ADMIN promote USER → ADMIN
    public boolean promoteToAdmin(String userIdStr, String currentAdminIdStr) {
        Integer userId = parse(userIdStr);
        Integer currentAdminId = parse(currentAdminIdStr);

        User current = userRepo.findById(currentAdminId).orElseThrow();
        User target = userRepo.findById(userId).orElseThrow();

        if (current.getRole() != Role.SUPER_ADMIN || target.getRole() != Role.USER)
            return false;

        target.setRole(Role.ADMIN);
        userRepo.save(target);
        return true;
    }

    // SUPER_ADMIN demote ADMIN → USER
    public boolean demoteAdminToUser(String adminIdStr, String currentAdminIdStr) {
        Integer adminId = parse(adminIdStr);
        Integer currentAdminId = parse(currentAdminIdStr);

        User current = userRepo.findById(currentAdminId).orElseThrow();
        User target = userRepo.findById(adminId).orElseThrow();

        if (current.getRole() == Role.SUPER_ADMIN && target.getRole() == Role.ADMIN) {
            target.setRole(Role.USER);           // 👈 Hạ cấp role
            userRepo.save(target);               // 👈 Lưu lại
            return true;
        }

        return false;
    }


    // ADMIN phụ xóa USER thường

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

        // ❌ Không ai được xóa SUPER_ADMIN (trừ khi bạn muốn cho phép)
        if (targetRole == Role.SUPER_ADMIN) return false;

        // ✅ SUPER_ADMIN được xóa bất kỳ ai (trừ SUPER_ADMIN khác)
        if (currentRole == Role.SUPER_ADMIN) {
            return performUserDeletion(target, targetId);
        }

        // ✅ ADMIN chỉ được xóa USER
        if (currentRole == Role.ADMIN && targetRole == Role.USER) {
            return performUserDeletion(target, targetId);
        }

        return false; // Các trường hợp còn lại đều bị từ chối
    }

    private boolean performUserDeletion(User target, int targetId) {
        commentRepo.deleteByUser(target);
        postLikeRepo.deleteByUser(target);
        trackingRepo.deleteByUser(target);
        dashboardRepo.deleteByUserId(targetId);
        chatMessageRepository.deleteByUserId((long) targetId);
        planRepo.deleteByUserId(String.valueOf(targetId));
        userProfileRepo.deleteByUser(target);
        userRepo.delete(target);
        return true;
    }



    private Integer parse(String str) {
        try {
            return Integer.parseInt(str);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID format");
        }
    }

}
