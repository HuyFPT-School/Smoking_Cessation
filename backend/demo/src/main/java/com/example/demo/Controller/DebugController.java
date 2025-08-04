package com.example.demo.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.sql.DataSource;
import java.sql.Connection;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class DebugController {

    @Autowired(required = false)
    private DataSource dataSource;

    // Test 1: Backend cơ bản (không cần database)
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("✅ Backend is running! Time: " + new java.util.Date());
    }

    // Test 2: Environment variables
    @GetMapping("/env")
    public ResponseEntity<String> testEnvironment() {
        try {
            String dbUrl = System.getenv("DB_URL");
            String dbUser = System.getenv("DB_USERNAME");
            boolean hasFirebase = System.getenv("FIREBASE_SERVICE_ACCOUNT") != null;
            
            return ResponseEntity.ok(String.format(
                "✅ Environment Variables:\n" +
                "DB_URL: %s\n" +
                "DB_USERNAME: %s\n" +
                "FIREBASE_SERVICE_ACCOUNT: %s",
                dbUrl != null ? "✅ SET" : "❌ NOT SET",
                dbUser != null ? "✅ SET" : "❌ NOT SET", 
                hasFirebase ? "✅ SET" : "❌ NOT SET"
            ));
        } catch (Exception e) {
            return ResponseEntity.ok("❌ Environment test failed: " + e.getMessage());
        }
    }

    // Test 3: Database connection
    @GetMapping("/database")
    public ResponseEntity<String> testDatabase() {
        try {
            if (dataSource == null) {
                return ResponseEntity.ok("❌ DataSource is null - Database not configured");
            }
            
            Connection connection = dataSource.getConnection();
            String dbName = connection.getCatalog();
            String dbUrl = connection.getMetaData().getURL();
            connection.close();
            
            return ResponseEntity.ok("✅ Database connected!\nDB: " + dbName + "\nURL: " + dbUrl);
        } catch (Exception e) {
            return ResponseEntity.ok("❌ Database connection failed: " + e.getMessage());
        }
    }

    // Test 4: System check tổng quan
    @GetMapping("/system")
    public ResponseEntity<String> systemCheck() {
        StringBuilder result = new StringBuilder("🔍 System Status:\n\n");
        
        // Backend
        result.append("1. Backend: ✅ Running\n");
        
        // Environment
        result.append("2. Environment: ");
        try {
            boolean hasDb = System.getenv("DB_URL") != null;
            boolean hasFirebase = System.getenv("FIREBASE_SERVICE_ACCOUNT") != null;
            result.append(hasDb && hasFirebase ? "✅ Configured\n" : "⚠️ Missing vars\n");
        } catch (Exception e) {
            result.append("❌ Error\n");
        }
        
        // Database
        result.append("3. Database: ");
        try {
            if (dataSource != null) {
                Connection conn = dataSource.getConnection();
                conn.close();
                result.append("✅ Connected\n");
            } else {
                result.append("❌ Not configured\n");
            }
        } catch (Exception e) {
            result.append("❌ Failed: " + e.getMessage() + "\n");
        }
        
        result.append("\n🎯 Diagnosis complete!");
        return ResponseEntity.ok(result.toString());
    }
}
