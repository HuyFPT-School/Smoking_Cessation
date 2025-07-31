package com.example.demo.Config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Lớp cấu hình bảo mật cho ứng dụng Spring Boot.
 * 
 * - Cho phép hoặc chặn các request từ phía client (trình duyệt, ứng dụng khác).
 * - Cấu hình CORS để cho phép frontend (React, Angular, ...) truy cập backend.
 * - Có thể mở rộng để kiểm soát quyền truy cập, xác thực, v.v.
 */

@Configuration // Đánh dấu đây là một lớp cấu hình Spring
@EnableWebSecurity // Bật tính năng bảo mật web của Spring Security
@EnableMethodSecurity // Cho phép sử dụng annotation kiểm soát quyền trên từng method
public class SecurityConfig {

    /**
     * Bean cấu hình chuỗi filter bảo mật cho ứng dụng.
     * 
     * - Tắt CSRF (bảo vệ chống tấn công giả mạo, thường dùng cho form truyền thống).
     * - Cho phép tất cả các request truy cập (có thể thay đổi để kiểm soát quyền sau này).
     * 
     * http Đối tượng cấu hình bảo mật HTTP
     * SecurityFilterChain đã cấu hình
     */

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable) // Tắt CSRF để thuận tiện cho phát triển API
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // Cho phép tất cả request (có thể thay đổi sau)

        return http.build();
    }
    
    /**
     * Bean cấu hình CORS cho ứng dụng.
     * 
     * - Cho phép frontend (chạy ở http://localhost:3000) gọi API backend.
     * - Cho phép các phương thức HTTP phổ biến: GET, POST, PUT, DELETE, OPTIONS.
     * - Cho phép gửi cookie và header tuỳ ý.
     * 
     * @return WebMvcConfigurer đã cấu hình CORS
     */

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Cho phép tất cả các đường dẫn
                        .allowedOrigins("https://smoking-cessation-kef557xo0-nhathuys-projects-e7dabf31.vercel.app") // Chỉ cho phép từ frontend này
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Các phương thức được phép
                        .allowedHeaders("*") // Cho phép tất cả các header
                        .allowCredentials(true); // Cho phép gửi cookie, thông tin xác thực
            }
        };
    }
}

