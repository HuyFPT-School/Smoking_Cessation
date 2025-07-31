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
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("🔄 Initializing Firebase Admin SDK...");

                InputStream serviceAccount = null;
                String serviceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT");
                if (serviceAccountJson != null && !serviceAccountJson.isEmpty()) {
                    System.out.println("ℹ️ Using service account from environment variable FIREBASE_SERVICE_ACCOUNT");
                    serviceAccount = new java.io.ByteArrayInputStream(serviceAccountJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                } else {
                    System.out.println("ℹ️ Using service account from classpath resource serviceAccountKey.json");
                    serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream();
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId("my-project-caaa7")
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Admin SDK initialized successfully");

                // Kiểm tra kết nối với Firebase bằng cách lấy danh sách user (giới hạn 1 user)
                try {
                    Thread.sleep(1000);
                    com.google.firebase.auth.FirebaseAuth.getInstance().listUsers(null, 1);
                    System.out.println("✅ Firebase connection test passed");
                } catch (Exception e) {
                    System.err.println("❌ Firebase connection test failed: " + e.getMessage());
                    if (e.getMessage() != null && e.getMessage().contains("Invalid JWT Signature")) {
                        System.err.println("💡 Hint: Try running 'w32tm /resync' as Administrator");
                    }
                }
            } else {
                System.out.println("✅ Firebase Admin SDK already initialized");
            }
        } catch (IOException e) {
            System.err.println("❌ Firebase initialization failed: " + e.getMessage());
            System.err.println("❌ Make sure serviceAccountKey.json exists and is valid, or the FIREBASE_SERVICE_ACCOUNT env variable is set");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Unexpected Firebase initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}