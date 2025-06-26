package com.example.demo.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("🔄 Initializing Firebase Admin SDK...");

                // Sử dụng try-with-resources để tự động đóng InputStream
                try (InputStream serviceAccount = new ClassPathResource("serviceAccountKey.json").getInputStream()) {
                    FirebaseOptions options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .setProjectId("my-project-caaa7")
                            .build();

                    FirebaseApp.initializeApp(options);
                    System.out.println("✅ Firebase Admin SDK initialized successfully");

                    // Test connection với giới hạn
                    try {
                        Thread.sleep(1000); // Delay nhỏ để đảm bảo khởi tạo hoàn tất
                        com.google.firebase.auth.FirebaseAuth.getInstance().listUsers(null, 1); // Chỉ lấy 1 user để test
                        System.out.println("✅ Firebase connection test passed");
                    } catch (Exception e) {
                        System.err.println("❌ Firebase connection test failed: " + e.getMessage());
                        if (e.getMessage().contains("Invalid JWT Signature")) {
                            System.err.println("💡 Hint: Try running 'w32tm /resync' as Administrator");
                        }
                    }
                }

            } else {
                System.out.println("✅ Firebase Admin SDK already initialized");
            }
        } catch (IOException e) {
            System.err.println("❌ Firebase initialization failed: " + e.getMessage());
            System.err.println("❌ Make sure serviceAccountKey.json exists and is valid");
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Unexpected Firebase initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}