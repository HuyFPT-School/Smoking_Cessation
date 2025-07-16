package com.example.demo.service.AdminServicePackage.user;

import com.example.demo.DTO.AdminUserDTO;
import com.example.demo.DTO.UserProfileDTO;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.UserProfile;
import com.example.demo.Repo.UserRepo;
import com.example.demo.Repo.UserProfileRepo;
import com.example.demo.Repo.PlanRepo;
import com.example.demo.service.AdminServicePackage.dashboard.CalculatorUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdminUserService {

    @Autowired private UserRepo userRepo;
    @Autowired private UserProfileRepo userProfileRepo;
    @Autowired private PlanRepo planRepo;
    @Autowired private CalculatorUtils calculatorUtils;

    // ============================================================================
    //  1. LẤY DANH SÁCH USER CHO ADMIN VÀ SUPER_ADMIN
    // ============================================================================

    /**
     *  Cả ADMIN và SUPER_ADMIN đều được xem danh sách người dùng thường (USER)
     */
    public List<AdminUserDTO> getAllUsersVisibleToAdmin(int currentAdminId) {

        // Lấy admin hiện tại từ ID truyền lên
        User current = userRepo.findById(currentAdminId)
                .orElseThrow(() -> new RuntimeException("Current admin not found"));

        Role role = current.getRole();
        if (role == null) {
            throw new RuntimeException("User has no role assigned");
        }

        // Chặn người không phải ADMIN hoặc SUPER_ADMIN
        if (role != Role.ADMIN && role != Role.SUPER_ADMIN) {
            throw new RuntimeException("Access denied: unsupported role");
        }

        // Lấy toàn bộ user có role là USER
        List<User> users = userRepo.findByRole(Role.USER);

        // Convert sang DTO để gửi cho frontend
        return users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================================
    //  2. LẤY DANH SÁCH ADMIN (chỉ dành cho SUPER_ADMIN)
    // ============================================================================

    /**
     *  Chỉ SUPER_ADMIN được xem danh sách ADMIN (loại bỏ SUPER_ADMIN khác)
     */
    public List<AdminUserDTO> getAllAdmins(int currentAdminId) {
        User current = userRepo.findById(currentAdminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Chặn nếu không phải SUPER_ADMIN
        if (current.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Permission denied");
        }

        // Lấy tất cả user có role ADMIN (loại trừ SUPER_ADMIN)
        List<User> adminUsers = userRepo.findByRole(Role.ADMIN);

        return adminUsers.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ============================================================================
    //  3. XEM CHI TIẾT THÔNG TIN CÁ NHÂN CỦA USER (trong modal)
    // ============================================================================

    /**
     *  Trả về thông tin chi tiết hồ sơ cá nhân của người dùng (userId)
     * → Gồm cả profile và user (id, name,…)
     */
    public UserProfileDTO getUserProfileByUserId(Integer userId) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) return null;

        User user = userOpt.get();

        Optional<UserProfile> profileOpt = userProfileRepo.findByUserId(userId);
        if (profileOpt.isEmpty()) return null;

        UserProfile profile = profileOpt.get();

        return new UserProfileDTO(
                user.getName(),
                profile.getPhone(),
                profile.getBirthdate(),
                profile.getGender(),
                profile.getBio(),
                profile.getSmokingAge(),
                profile.getYearsSmoked(),
                profile.getOccupation(),
                profile.getHealthStatus(),
                user.getId()
        );
    }

    // ============================================================================
    //  4. HÀM DÙNG CHUNG ĐỂ CONVERT USER → AdminUserDTO
    // ============================================================================

    /**
     *  Chuyển entity User sang DTO AdminUserDTO để hiển thị lên bảng quản lý
     * → Gồm: id, tên, email, avatar, phone, role, và số ngày không hút thuốc
     */
    private AdminUserDTO convertToDTO(User user) {

        // Lấy số điện thoại từ bảng user_profile (nếu có)
        String phone = userProfileRepo.findByUserId(user.getId())
                .map(UserProfile::getPhone)
                .orElse("");

        // Tính số ngày không hút thuốc từ Plan (nếu có)
        long daysSmokeFree = planRepo.findByUserId(user.getId())
                .map(calculatorUtils::calculateDaysSmokeFree)
                .orElse(0L);

        return new AdminUserDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                phone,
                user.getRole(),
                user.getAvatarUrl()
        );
    }
}
