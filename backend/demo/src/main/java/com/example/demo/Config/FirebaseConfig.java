package com.example.demo.Config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                System.out.println("🔄 Initializing Firebase Admin SDK...");
                
                // Đọc file và tạo fresh InputStream mỗi lần
                ClassPathResource resource = new ClassPathResource("serviceAccountKey.json");
                if (!resource.exists()) {
                    throw new IOException("serviceAccountKey.json not found in classpath");
                }
                
                // Đọc toàn bộ file vào memory trước
                byte[] keyBytes = resource.getInputStream().readAllBytes();
                System.out.println("📁 Service account key file size: " + keyBytes.length + " bytes");
                
                // Tạo fresh InputStream từ bytes
                InputStream serviceAccount = new java.io.ByteArrayInputStream(keyBytes);

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .setProjectId("my-project-caaa7")
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase Admin SDK initialized successfully");
                
                // Test connection với retry mechanism
                testFirebaseConnection();
                
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
    
    private void testFirebaseConnection() {
        int maxRetries = 3;
        int retryCount = 0;
        
        while (retryCount < maxRetries) {
            try {
                System.out.println("🔍 Testing Firebase connection (attempt " + (retryCount + 1) + ")...");
                
                // Thêm delay để đảm bảo token được tạo đúng
                if (retryCount > 0) {
                    Thread.sleep(2000 * retryCount); // 2s, 4s, 6s
                }
                
                com.google.firebase.auth.FirebaseAuth.getInstance().listUsers(null, 1);
                System.out.println("✅ Firebase connection test passed");
                return;
                
            } catch (Exception e) {
                retryCount++;
                System.err.println("❌ Firebase connection test failed (attempt " + retryCount + "): " + e.getMessage());
                
                if (retryCount >= maxRetries) {
                    System.err.println("💡 All retry attempts failed. Possible solutions:");
                    System.err.println("   1. Sync system time: Run 'w32tm /resync' as Administrator");
                    System.err.println("   2. Download fresh service account key from Firebase Console");
                    System.err.println("   3. Check internet connection");
                    System.err.println("   4. Restart application after time sync");
                } else {
                    System.out.println("🔄 Retrying in " + (2 * retryCount) + " seconds...");
                }
            }
        }
    }
}
