package com.example.demo.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

/**
 * Lớp cấu hình để khởi tạo Firebase Admin SDK cho ứng dụng Spring Boot.
 * 
 * Khi ứng dụng khởi động, lớp này sẽ tự động chạy và thiết lập kết nối với Firebase
 * sử dụng file khóa dịch vụ (serviceAccountKey.json).
 */

@Configuration // Đánh dấu đây là một lớp cấu hình Spring
public class FirebaseConfig {

    /**
     * Phương thức này sẽ tự động được gọi sau khi Spring khởi tạo bean này.
     * Nó dùng để khởi tạo Firebase Admin SDK nếu chưa được khởi tạo trước đó.
     */

    @PostConstruct // Annotation giúp tự động chạy hàm này sau khi bean được tạo
    public void initializeFirebase() {
        try {
            // Kiểm tra nếu Firebase chưa được khởi tạo thì mới tiến hành khởi tạo
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("🔄 Initializing Firebase Admin SDK...");

                // Đọc file serviceAccountKey.json từ thư mục resources (classpath)
                // Sử dụng try-with-resources để tự động đóng InputStream sau khi dùng xong
                try (InputStream serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream()) {
                    // Tạo đối tượng cấu hình Firebase với thông tin xác thực và projectId
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount)) // Đọc credentials từ file
                            .setProjectId("my-project-caaa7") // ID của project Firebase
                            .build();

                    // Khởi tạo FirebaseApp với cấu hình trên
                    FirebaseApp.initializeApp(options);
                    System.out.println("✅ Firebase Admin SDK initialized successfully");

                    // Kiểm tra kết nối với Firebase bằng cách lấy danh sách user (giới hạn 1 user)
                    try {
                        Thread.sleep(1000); // Chờ 1 giây để đảm bảo khởi tạo hoàn tất
                        com.google.firebase.auth.FirebaseAuth.getInstance().listUsers(null, 1); // Lấy 1 user để test
                        System.out.println("✅ Firebase connection test passed");
                    } catch (Exception e) {
                        System.err.println("❌ Firebase connection test failed: " + e.getMessage());
                        // Nếu lỗi liên quan đến chữ ký JWT, gợi ý đồng bộ thời gian hệ thống
                        if (e.getMessage().contains("Invalid JWT Signature")) {
                            System.err.println("💡 Hint: Try running 'w32tm /resync' as Administrator");
                        }
                    }
                }

            } else {
                // Nếu đã khởi tạo rồi thì chỉ log ra thông báo
                System.out.println("✅ Firebase Admin SDK already initialized");
            }
        } catch (IOException e) {
            // Xử lý lỗi khi không đọc được file serviceAccountKey.json
            System.err.println("❌ Firebase initialization failed: " + e.getMessage());
            System.err.println("❌ Make sure serviceAccountKey.json exists and is valid");
            e.printStackTrace();
        } catch (Exception e) {
            // Xử lý các lỗi bất ngờ khác
            System.err.println("❌ Unexpected Firebase initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}