package com.example.demo.Controller;

import com.example.demo.DTO.AIResponseDTO;
import com.example.demo.DTO.ChatMessageDTO;
import com.example.demo.DTO.ChatRequestDTO;
import com.example.demo.service.GeminiAICoachService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai-coach")
@CrossOrigin
public class AICoachController {
    
    @Autowired
    private GeminiAICoachService geminiAICoachService;
    
    @PostMapping("/chat")
    public ResponseEntity<AIResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        try {
            // Validate request
            if (request.getUserId() == null || request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(new AIResponseDTO("Vui lòng nhập tin nhắn hợp lệ.", "error"));
            }
            
            // ✅ THÊM: Simple rate limiting (optional)
            try {
                long todayCount = geminiAICoachService.getTodayMessageCount(request.getUserId());
                if (todayCount > 50) { // Giới hạn 50 tin nhắn/ngày
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                        .body(new AIResponseDTO("Bạn đã chat khá nhiều hôm nay! Hãy nghỉ ngơi và quay lại sau nhé! 😊", "rate_limited"));
                }
            } catch (Exception e) {
                // Nếu count fails, vẫn cho phép chat
                System.out.println("Rate limiting check failed, allowing chat: " + e.getMessage());
            }
            
            AIResponseDTO response = geminiAICoachService.generateResponse(request);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error in chat endpoint: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new AIResponseDTO("Xin lỗi, tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau. 😊", "error"));
        }
    }
      @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<ChatMessageDTO>> getConversationHistory(@PathVariable Long userId) {
        try {
            List<ChatMessageDTO> history = geminiAICoachService.getConversationHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            System.err.println("Error getting conversation history: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
