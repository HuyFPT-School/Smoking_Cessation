package com.example.demo.service.AdminServicePackage.dashboard;

import com.example.demo.Repo.UserRepo;
import com.example.demo.entity.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;

//  Service dùng cho Admin Dashboard — thống kê tăng trưởng số lượng người dùng thường (Role.USER)
@Service  // Spring sẽ quản lý bean này để tự inject vào các nơi cần dùng
public class UserGrowthService {

    // Inject repository để thao tác với bảng User
    @Autowired
    private UserRepo userRepo;

    // ===========================================
    //  1. ĐẾM TỔNG SỐ USER
    // ===========================================

    /**
     *  Trả về tổng số người dùng có role là USER (bỏ qua ADMIN, SUPER_ADMIN)
     */
    public long countTotalUsers() {
        return userRepo.countByRole(Role.USER);
    }

    // ===========================================
    //  2. TÍNH TỶ LỆ TĂNG TRƯỞNG
    // ===========================================

    /**
     * Tính % tăng trưởng người dùng trong tháng này so với tháng trước
     *  Công thức: ((thisMonth - lastMonth) / lastMonth) * 100
     */
    public double calculateGrowthRate() {
        LocalDate today = LocalDate.now();  // Ngày hiện tại

        // ===== Tháng hiện tại =====
        LocalDateTime startCurrent = today.withDayOfMonth(1).atStartOfDay();  // 00:00 ngày 1
        LocalDateTime endCurrent = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59); // 23:59:59 ngày cuối

        // ===== Tháng trước =====
        LocalDate lastMonth = today.minusMonths(1);
        LocalDateTime startLast = lastMonth.withDayOfMonth(1).atStartOfDay();  // 00:00 ngày 1 của tháng trước
        LocalDateTime endLast = lastMonth.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

        // Số lượng user mới tạo trong mỗi tháng
        long usersThisMonth = userRepo.countByRoleAndCreateAtBetween(Role.USER, startCurrent, endCurrent);
        long usersLastMonth = userRepo.countByRoleAndCreateAtBetween(Role.USER, startLast, endLast);

        //  Tính tỷ lệ tăng trưởng
        if (usersLastMonth > 0) {
            return (double)(usersThisMonth - usersLastMonth) / usersLastMonth * 100;
        } else {
            // Nếu tháng trước không có ai thì coi như tăng 100% nếu có user mới, hoặc 0% nếu vẫn không có ai
            return usersThisMonth > 0 ? 100 : 0;
        }
    }

    // ===========================================
    //  3. LẤY SỐ USER MỚI TRONG THÁNG NÀY
    // ===========================================

    /**
     * ✅ Trả về số người dùng mới được tạo trong tháng hiện tại
     */
    public long getUsersThisMonth() {
        LocalDate today = LocalDate.now();

        LocalDateTime start = today.withDayOfMonth(1).atStartOfDay();  // 00:00 ngày 1
        LocalDateTime end = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);  // 23:59:59 ngày cuối

        return userRepo.countByRoleAndCreateAtBetween(Role.USER, start, end);
    }
}
