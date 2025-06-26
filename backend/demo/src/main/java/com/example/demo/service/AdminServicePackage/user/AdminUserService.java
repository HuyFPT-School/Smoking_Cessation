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

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private PlanRepo planRepo;

    @Autowired
    private CalculatorUtils calculatorUtils;


    public List<AdminUserDTO> getAllUsersForAdmin(int currentAdminId) {
        User current = userRepo.findById(currentAdminId)
                .orElseThrow(() -> new RuntimeException("Current admin not found"));

        Role role = current.getRole();
        if (role == null) {
            throw new RuntimeException("User has no role assigned");
        }

        List<User> users;

        if (role == Role.SUPER_ADMIN) {
            users = userRepo.findByRole(Role.ADMIN);
        } else if (role == Role.ADMIN) {
            users = userRepo.findByRole(Role.USER);
        } else {
            throw new RuntimeException("Access denied: unsupported role");
        }

        return users.stream().map(user -> {
            String phone = userProfileRepo.findByUserId(user.getId())
                    .map(UserProfile::getPhone).orElse("");

            long daysSmokeFree = planRepo.findByUserId(String.valueOf(user.getId()))
                    .map(calculatorUtils::calculateDaysSmokeFree)
                    .orElse(0L);

            return new AdminUserDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    phone,
                    daysSmokeFree,
                    user.getRole()
            );
        }).collect(Collectors.toList());
    }


    public List<AdminUserDTO> getAllRegularUsers() {
        List<User> users = userRepo.findByRole(Role.USER);

        return users.stream().map(user -> {
            String phone = userProfileRepo.findByUserId(user.getId())
                    .map(UserProfile::getPhone).orElse("");

            long daysSmokeFree = planRepo.findByUserId(String.valueOf(user.getId()))
                    .map(calculatorUtils::calculateDaysSmokeFree)
                    .orElse(0L);

            return new AdminUserDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    phone,
                    daysSmokeFree,
                    user.getRole()
            );
        }).collect(Collectors.toList());
    }

    /**
     * SUPER_ADMIN xem danh sách các ADMIN (không bao gồm SUPER_ADMIN)
     */
    public List<AdminUserDTO> getAllAdmins(int currentAdminId) {
        User current = userRepo.findById(currentAdminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        if (current.getRole() != Role.SUPER_ADMIN) {
            throw new RuntimeException("Permission denied");
        }

        // Chỉ lấy những người có role là ADMIN (không bao gồm SUPER_ADMIN)
        List<User> adminUsers = userRepo.findByRole(Role.ADMIN);

        return adminUsers.stream().map(user -> {
            String phone = userProfileRepo.findByUserId(user.getId())
                    .map(UserProfile::getPhone).orElse("");

            long daysSmokeFree = planRepo.findByUserId(user.getUid())
                    .map(calculatorUtils::calculateDaysSmokeFree)
                    .orElse(0L);



            return new AdminUserDTO(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    phone,
                    daysSmokeFree,
                    user.getRole()
            );
        }).collect(Collectors.toList());
    }

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
}
