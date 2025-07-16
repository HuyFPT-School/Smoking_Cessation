package com.example.demo.service;

import com.example.demo.DTO.AIResponseDTO;
import com.example.demo.DTO.ChatMessageDTO;
import com.example.demo.DTO.ChatRequestDTO;
import com.example.demo.Repo.ChatMessageRepository;
import com.example.demo.entity.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.util.Calendar;

@Service // Đây là nhãn cho Spring Boot biết đây là một "dịch vụ" - như một nhân viên chuyên làm việc gì đó
public class GeminiAICoachService {
    // Như chìa khóa để mở cửa nhà Google AI - cần có để được phép sử dụng dịch vụ AI
    @Value("${google.ai.api.key}")
    private String apiKey;
    @Value("${google.ai.model:gemini-1.5-flash}")  //  Using free Flash model for unlimited usage
    private String model;

    // Để lưu/lấy tin nhắn từ database
    @Autowired
    private ChatMessageRepository chatMessageRepository;
    
    // Công cụ để gửi HTTP request đến API bên ngoài
    // Như một người đưa thư, chuyên gửi tin nhắn qua internet
    private final RestTemplate restTemplate = new RestTemplate();
    
    //  TẠO PHẢN HỒI AI
    public AIResponseDTO generateResponse(ChatRequestDTO request) {
        try {
            // Lưu tin nhắn user
            saveChatMessage(request.getUserId(), request.getMessage(), "USER");
            
            // Tạo context cho coach
            String prompt = buildCoachPrompt(request.getMessage(), request.getUserId());
            
            // Gọi Gemini API
            String aiResponse = callGeminiAPIWithRetry(prompt);
            
            // Lưu phản hồi AI
            saveChatMessage(request.getUserId(), aiResponse, "AI");
            
            return new AIResponseDTO(aiResponse);
        } catch (Exception e) {
            System.err.println("Error generating AI response: " + e.getMessage());
            // Nếu AI lỗi, dùng câu trả lời dự phòng thông minh
            String fallbackResponse = getSmartFallbackResponse(request.getMessage());
            saveChatMessage(request.getUserId(), fallbackResponse, "AI");
            return new AIResponseDTO(fallbackResponse, "fallback");
        }
    }

    // GỌI API GEMINI
    private String callGeminiAPI(String prompt) {
        //  Giống như bạn tìm số điện thoại của chuyên gia tư vấn cai thuốc lá trong danh bạ. 
        //  apiKey là như một "mã khách hàng VIP" để Google biết bạn có quyền gọi cho AI này.
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", 
                                   model, apiKey);
        //  Thông tin kèm theo yêu cầu (kiểu dữ liệu JSON)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt) // // Câu hỏi của người dùng
                ))
            ),  "generationConfig", Map.of(
                "temperature", 0.4,  //  Điều chỉnh độ sáng tạo (0.4 = khá ổn định)
                "topK", 30,          // Kiểm soát cách AI chọn từ
                "topP", 0.8,         // Giới hạn độ dài phản hồi
                "maxOutputTokens", 400,  // Giới hạn độ dài phản hồi
                "candidateCount", 1,     // Số phản hồi được tạo
                "stopSequences", List.of("---", "###", "User:", "Q:") // Dừng khi gặp các chuỗi này
            ),
            "safetySettings", List.of( // Bộ lọc an toàn, chỉ chặn nội dung rất có hại, cho phép mức độ nhẹ
                Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_ONLY_HIGH"), // quấy rối
                Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_ONLY_HIGH"), // Lọc lời nói thù địch
                Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_ONLY_HIGH"), // nội dung khiêu dâm
                Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_ONLY_HIGH") // nội dung nguy hiểm
            )
        );
        
        // Gửi yêu cầu POST đến API
        // Giống như bạn đóng gói câu hỏi và gửi đến Google AI
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
          try {
            // đóng gói gói tin hoàn chỉnh (nội dung + header)
            // restTemplate.postForEntity() = gửi gói tin đến Google AI
            // response = nhận phản hồi từ Google
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
              if (response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // Kiểm tra có phản hồi không
                if (responseBody.containsKey("error")) {
                    // Lấy nội dung phản hồi
                    Map errorObj = (Map) responseBody.get("error");
                    String errorMsg = "Gemini API Error: " + errorObj.get("message");
                    System.err.println(errorMsg);
                    throw new RuntimeException(errorMsg);
                }
                // danh sách các phản hồi có thể từ AI
                List<Map> candidates = (List<Map>) responseBody.get("candidates");
                // Thường chỉ có 1 phản hồi (vì candidateCount = 1)
                // candidates.get(0) = lấy phản hồi đầu tiên
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = candidates.get(0);
                    
                    //  Kiểm tra xem nội dung có bị "kiểm duyệt" không.
                    if (candidate.containsKey("finishReason")) {
                        // Lý do AI dừng trả lời
                        String finishReason = (String) candidate.get("finishReason");
                        System.out.println("Finish reason: " + finishReason);
                        // "SAFETY": AI chặn vì nội dung không an toàn (như hỏi về tự tử, bạo lực...)
                        // "RECITATION": AI chặn vì đang lặp lại nội dung sẵn có (như sao chép trang web)
                        if ("SAFETY".equals(finishReason)) {
                            return "Tôi hiểu bạn đang cần hỗ trợ, nhưng hãy thử diễn đạt khác một chút để tôi có thể giúp bạn tốt hơn. 😊";
                        } else if ("RECITATION".equals(finishReason)) {
                            return "Hãy thử hỏi theo cách khác, tôi sẽ cố gắng đưa ra lời khuyên phù hợp cho bạn! 💡";
                        }
                    }
                    //  Lấy Nội Dung Phản Hồi
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List<Map> parts = (List<Map>) content.get("parts");
                        
                        if (parts != null && !parts.isEmpty()) {
                            String aiText = (String) parts.get(0).get("text");
                            if (aiText != null && !aiText.trim().isEmpty()) {
                                System.out.println("✅ AI response generated successfully");
                                return aiText.trim();
                            }
                        }
                    }
                }
                
                // Log the response structure for debugging  
                System.err.println("⚠️ Unexpected response structure. Candidates: " + 
                    (candidates != null ? candidates.size() : "null"));
            } else {
                System.err.println("❌ Empty response body from Gemini API");
            }
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Gemini API call failed: " + e.getMessage());
        }
        
        throw new RuntimeException("No valid response from Gemini API");
    }
    
    private String callGeminiAPIWithRetry(String prompt) {
        //  Mình sẽ chỉ thử gọi tối đa 3 lần
        int maxRetries = 3;
        // Giữa các lần gọi, mình sẽ đợi 1 giây, và tăng dần thời gian chờ giữa các lần gọi
        int retryDelay = 1000; // 1 second
        
        // Mình sẽ bắt đầu gọi, ghi nhớ đây là lần thử thứ mấy
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                System.out.println("Gemini API attempt " + attempt + "/" + maxRetries);
                // Nhấn nút gọi cho bác sĩ AI, gửi câu hỏi của bệnh nhân
                return callGeminiAPI(prompt);
            } catch (Exception e) {
                System.err.println("Attempt " + attempt + " failed: " + e.getMessage());
                
                // "Nếu đây là lần thử cuối cùng rồi (lần thứ 3)"
                // "Đành chịu thua, báo lỗi lên cho hệ thống biết chắc chắn không gọi được"
                if (attempt == maxRetries) {
                    throw e; // Throw after final attempt
                }
                
                try {
                    Thread.sleep(retryDelay * attempt); // Đợi một lúc trước khi gọi lại, Kiểu như: "Bác sĩ bận, đợi lâu hơn một chút rồi gọi lại"
                } catch (InterruptedException ie) {
                    // Nếu Bị Gián Đoạn Khi Đang Đợi
                    Thread.currentThread().interrupt(); // Nếu có ai đó làm phiền khi đang đợi để gọi lại
                    throw new RuntimeException("Retry interrupted", ie); // Báo lỗi: 'Xin lỗi, tôi bị gián đoạn khi đang cố gắng gọi lại'
                }
            }
        }
        
        throw new RuntimeException("All retry attempts failed");
        // Dòng này gần như không bao giờ chạy đến (vì loop đã xử lý mọi trường hợp)
        // "Báo lỗi cuối cùng: Đã thử mọi cách gọi nhưng không được"
    }

    // Tạo "Kịch Bản" Cho AI
    private String buildCoachPrompt(String userMessage, Long userId) {
        // Lấy context từ lịch sử chat
        // Giống như việc nhìn lại 5 tin nhắn gần nhất giữa người dùng và AI để nắm bắt cuộc trò chuyện.
        List<ChatMessage> recentMessages = chatMessageRepository
            .findTop5ByUserIdOrderByCreatedAtDesc(userId);
        
        StringBuilder context = new StringBuilder();
        
        // Giống như đạo diễn nói với diễn viên: "Bạn sẽ đóng vai bác sĩ nổi tiếng Sarah Chen, một chuyên gia về cai thuốc lá".
        //  Việc này giúp AI hiểu rõ vai trò và cách nói chuyện phù hợp.
        context.append("## PERSONA - AI COACH SARAH CHEN\n");
        context.append("Bạn là Sarah Chen, một chuyên gia cai nghiện thuốc lá hàng đầu với:\n");
        context.append("- 15 năm kinh nghiệm lâm sàng tại Mayo Clinic\n");
        context.append("- Tiến sĩ Tâm lý học Sức khỏe từ Harvard Medical School\n");
        context.append("- Chứng chỉ Certified Tobacco Treatment Specialist (CTTS)\n");
        context.append("- Đã giúp hơn 5,000 người cai thuốc thành công\n");
        context.append("- Tác giả cuốn sách bestseller 'Breaking Free: The Science of Quitting Smoking'\n\n");
        
        //  Như việc gửi "tài liệu nghiên cứu" cho AI đọc trước khi tư vấn.
        //  Giúp AI có thông tin chính xác về cách nicotine tác động lên não bộ và cơ thể.
        context.append("## KIẾN THỨC CHUYÊN MÔN\n");
        context.append("### Sinh lý học nghiện nicotin:\n");
        context.append("- Nicotin kích hoạt hệ thống dopamine trong não, tạo cảm giác khoái cảm\n");
        context.append("- Thời gian bán hủy nicotin: 1-2 giờ, nicotine withdrawal: 3-4 tuần\n");
        context.append("- Receptors nicotin sẽ phục hồi hoàn toàn sau 3 tháng\n\n");
        // Giống như cung cấp cho AI một "bộ công cụ" với các kỹ thuật cụ thể để giúp người dùng vượt qua cơn thèm thuốc.
        context.append("### Kỹ thuật xử lý cơn thèm (4D Method):\n");
        context.append("1. **Delay**: Hoãn lại 5-10 phút (cơn thèm chỉ kéo dài 3-5 phút)\n");
        context.append("2. **Deep Breathing**: Thở sâu 4-7-8 (hít 4 giây, giữ 7 giây, thở ra 8 giây)\n");
        context.append("3. **Drink Water**: Uống nước lạnh, nhai đá viên\n");
        context.append("4. **Do Something**: Thay đổi hoạt động, di chuyển, làm việc khác\n\n");
        
        // PHÂN TÍCH NGỮ CẢNH THÔNG MINH
        // Giống như việc AI được tư vấn bởi một "chuyên gia tâm lý" đã phân tích cảm xúc và nhu cầu của người dùng trước cuộc trò chuyện.
        context.append("## PHÂN TÍCH NGỮ CẢNH\n");
        String messageAnalysis = analyzeUserMessage(userMessage);
        context.append("Phân tích tin nhắn người dùng: ").append(messageAnalysis).append("\n\n");
        
        // LỊCH SỬ CHAT THÔNG MINH
        // Giống như việc cho AI xem "biên bản cuộc họp trước" để không hỏi lại những điều người dùng đã chia sẻ.
        if (!recentMessages.isEmpty()) {
            context.append("## LỊCH SỬ TRƯỚC ĐÂY\n");
            Collections.reverse(recentMessages);
            String conversationPattern = analyzeConversationPattern(recentMessages);
            context.append("Pattern phân tích: ").append(conversationPattern).append("\n");
            
            for (ChatMessage msg : recentMessages) {
                if ("USER".equals(msg.getSenderType())) {
                    context.append("👤 User: ").append(msg.getMessage()).append("\n");
                } else {
                    context.append("🤖 Sarah: ").append(msg.getMessage()).append("\n");
                }
            }
            context.append("\n");
        }
        
        // EXAMPLES THÔNG MINH (Few-shot Learning)
        // Giống như huấn luyện viên chỉ cho AI: "Đây là cách trả lời tốt nhất khi người dùng nói họ thèm thuốc".
        context.append("## VÍ DỤ PHẢN HỒI CHẤT LƯỢNG\n");
        context.append("Q: \"Tôi rất thèm thuốc lúc này\"\n");
        context.append("A: \"Tôi hiểu cơn thèm này rất khó chịu! 💪 Đây là não bộ đang 'đòi' dopamine. Hãy thử kỹ thuật 4-7-8: hít sâu 4 giây, giữ 7 giây, thở ra 8 giây. Cơn thèm chỉ kéo dài 3-5 phút thôi - bạn mạnh hơn nó! 🌟\"\n\n");
        
        context.append("Q: \"Tôi đã cai được 2 tuần rồi\"\n");
        context.append("A: \"Tuyệt vời! 🎉 Sau 2 tuần, lưu thông máu đã cải thiện 30% và phổi bắt đầu tự làm sạch. Giai đoạn khó khăn nhất đã qua, giờ là lúc xây dựng thói quen mới. Bạn có kế hoạch gì để thay thế thói quen hút thuốc không? 🌟\"\n\n");
        
        // TIN NHẮN HIỆN TẠI
        // Thêm câu hỏi của người dùng vào "kịch bản" sau khi đã "làm sạch" (loại bỏ từ ngữ không phù hợp).
        context.append("## TIN NHẮN HIỆN TẠI\n");
        context.append("User: \"").append(sanitizePrompt(userMessage)).append("\"\n\n");
        
        context.append("## YÊU CẦU PHẢN HỒI\n");
        context.append("Dựa trên kiến thức chuyên môn và phân tích ngữ cảnh, hãy đưa ra phản hồi:\n");
        context.append("- Thấu hiểu cảm xúc của người dùng\n");
        context.append("- Giải thích khoa học ngắn gọn (nếu phù hợp)\n");
        context.append("- Đưa ra giải pháp cụ thể, thực tế\n");
        context.append("- Động viên tích cực và professional\n");
        context.append("- Sử dụng emoji phù hợp\n");
        context.append("- Độ dài: 2-4 câu, súc tích nhưng đầy đủ thông tin\n\n");
        //  Đây là cú "Action!" - báo hiệu AI bắt đầu trả lời với tư cách là Sarah Chen.
        context.append("Sarah Chen phản hồi:");
        
        return context.toString();
    }
    // SIÊU NÂNG CẤP: Smart fallback responses thông minh
    // Nếu AI không trả lời được, sẽ dùng các câu trả lời dự phòng thông minh
    private String getSmartFallbackResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        
        // CƠN THÈM THUỐC - Responses chi tiết
        // Nếu người dùng nói về cơn thèm thuốc, AI sẽ đưa ra các phản hồi cụ thể và khoa học
        if (msg.contains("thèm") || msg.contains("muốn hút") || msg.contains("craving") || 
            msg.contains("nhớ thuốc") || msg.contains("khó chịu")) {
            String[] cravingResponses = {
                "Cơn thèm này là dấu hiệu não bộ đang 'đòi hỏi' dopamine! 💪 Hãy thử kỹ thuật 4D: Delay 5 phút → Deep breathing (4-7-8) → Drink water → Do something else. Cơn thèm chỉ kéo dài 3-5 phút thôi, bạn mạnh hơn nó! �",
                "Tôi hiểu cơn thèm này rất khó chịu! 🌸 Đây là lúc nicotin receptors đang 'phản kháng'. Hãy nhai kẹo cao su, uống nước chanh hoặc gọi điện cho ai đó. Mỗi cơn thèm vượt qua là một chiến thắng lớn! ✨",
                "Cơn thèm xuất hiện là bình thường! 🎯 Hãy nhớ: 20 phút đầu khó khăn nhất, sau đó sẽ dễ dần. Thử làm 10 push-ups hoặc đi bộ quanh nhà. Bạn đã mạnh mẽ đến mức này rồi, đừng bỏ cuộc! 💪"
            };
            return cravingResponses[new Random().nextInt(cravingResponses.length)];
        }
        
        // STRESS/ANXIETY - Hỗ trợ tâm lý chuyên sâu
        // Nếu người dùng nói về căng thẳng, AI sẽ đưa ra các phản hồi liên quan đến stress và lo lắng
        if (msg.contains("stress") || msg.contains("căng thẳng") || msg.contains("lo lắng") || 
            msg.contains("áp lực") || msg.contains("buồn")) {
            String[] stressResponses = {
                "Stress là trigger phổ biến nhất! 🌸 Khi căng thẳng, cortisol tăng làm cơn thèm mạnh hơn. Hãy thử: thở sâu 4-7-8, nghe nhạc thư giãn, hoặc massage nhẹ thái dương. Não bộ cần 21 ngày để thích nghi với thói quen mới! 💪",
                "Tôi hiểu bạn đang áp lực! 🌟 Hãy nhớ: mỗi ngày không hút thuốc, bạn đã giảm 50% nguy cơ đau tim. Thử kỹ thuật grounding: đếm 5 thứ nhìn thấy, 4 thứ sờ được, 3 âm thanh, 2 mùi, 1 vị. Bạn xứng đáng có cuộc sống khỏe mạnh! ✨"
            };
            return stressResponses[new Random().nextInt(stressResponses.length)];
        }
        
        // TIẾN TRÌNH CẢI THUỐC - Động viên cụ thể
        // Nếu người dùng nói về thời gian cai thuốc, AI sẽ đưa ra các phản hồi động viên và khoa học
        if (msg.contains("ngày") || msg.contains("tuần") || msg.contains("tháng") || 
            msg.contains("đã cai") || msg.contains("bao lâu")) {
            String[] progressResponses = {
                "Wow, thật tuyệt vời! 🎉 Mỗi mốc thời gian đều có ý nghĩa khoa học: 20 phút - tim bình thường, 12 giờ - CO giảm, 2 tuần - lưu thông tốt, 1 tháng - phổi tự làm sạch. Bạn đang trải qua phép màu của cơ thể! 🌟",
                "Tôi rất tự hào về bạn! 💪 Nghiên cứu cho thấy: càng lâu cai, tỷ lệ thành công càng cao. Bạn đã vượt qua giai đoạn khó khăn nhất rồi! Hãy tự thưởng cho mình điều gì đó đặc biệt nhé! ✨"
            };
            return progressResponses[new Random().nextInt(progressResponses.length)];
        }
        
        // TĂNG CÂN - Giải pháp khoa học
        // Nếu người dùng lo lắng về việc tăng cân sau khi cai thuốc, AI sẽ đưa ra các phản hồi khoa học và động viên
        if (msg.contains("tăng cân") || msg.contains("béo") || msg.contains("weight") || 
            msg.contains("cân nặng") || msg.contains("ăn nhiều")) {
            return "Lo lắng về cân nặng rất bình thường! 🌸 Chỉ 10% người cai thuốc tăng cân >5kg. Bí quyết: thay thế nicotine bằng protein (trứng, hạt), uống nước trước khi ăn, và tập HIIT 15 phút/ngày. Phổi khỏe quan trọng hơn 2-3kg! 💪";
        }
        
        // BẮT ĐẦU CAI THUỐC - Hướng dẫn chi tiết
        // Nếu người dùng nói về việc bắt đầu cai thuốc, AI sẽ đưa ra các phản hồi hướng dẫn chi tiết
        if (msg.contains("bắt đầu") || msg.contains("cai") || msg.contains("quit") || 
            msg.contains("muốn bỏ") || msg.contains("dự định")) {
            return "Quyết định cai thuốc là bước đầu quan trọng nhất! 🎯 Hãy chọn 'Ngày D' trong vòng 2 tuần, loại bỏ tất cả thuốc lá/dụng cụ, và chuẩn bị 'survival kit': nước, kẹo cao su, stress ball. Thông báo với gia đình để được support. Bạn có thể làm được! 🌟";
        }
        
        // KHÓ KHĂN CHUNG
        // Nếu người dùng nói về khó khăn trong quá trình cai thuốc, AI sẽ đưa ra các phản hồi động viên
        if (msg.contains("khó") || msg.contains("khó khăn") || msg.contains("zor")) {
            return "Tôi biết điều này không dễ dàng gì! 💪 Nhưng hãy nhớ: những khó khăn lớn nhất thường dẫn đến những thành công lớn nhất. Sau 72 giờ, nicotine hoàn toàn thoát khỏi cơ thể. Bạn đang đi đúng hướng! 🌟";
        }
        
        // GENERAL FALLBACK - Chuyên nghiệp
        // Nếu không có từ khóa nào phù hợp, AI sẽ đưa ra phản hồi chung
        String[] generalResponses = {
            "Tôi hiểu bạn đang cần hỗ trợ trong hành trình cai thuốc! 💪 Hãy chia sẻ cụ thể hơn về tình trạng hiện tại để tôi có thể đưa ra lời khuyên phù hợp nhất. Mỗi người có cách cai thuốc khác nhau! 🌟",
            "Cảm ơn bạn đã tin tưởng chia sẻ! 🌸 Hành trình cai thuốc không dễ dàng, nhưng với kiến thức khoa học và sự hỗ trợ đúng cách, tỷ lệ thành công lên đến 30-50%. Tôi luôn ở đây để hỗ trợ bạn! ✨",
            "Mỗi ngày không hút thuốc đều là một chiến thắng to lớn! 🎉 Hãy nhớ: não bộ cần 21-66 ngày để hình thành thói quen mới. Kiên nhẫn với bản thân và tự hào về từng bước nhỏ bạn đã đạt được! 💪",
            "Tôi đang gặp một chút sự cố kỹ thuật, nhưng điều đó không làm giảm quyết tâm của bạn đúng không? 🌟 Hãy tiếp tục cố gắng, tôi tin bạn có thể vượt qua mọi thử thách! 💫"
        };
        
        return generalResponses[new Random().nextInt(generalResponses.length)];
    }

    // Lưu Tin Nhắn
    private void saveChatMessage(Long userId, String message, String senderType) {
        ChatMessage chatMessage = ChatMessage.builder()
            .userId(userId)           // ID người dùng (ai đang trò chuyện)
            .message(message)         // Nội dung tin nhắn (câu hỏi, phản hồi...)
            .senderType(senderType)   // Ai gửi tin nhắn (USER hoặc AI)
            .createdAt(new Date())    // Thời gian gửi tin nhắn (ngày giờ hiện tại)
            .build();                 // Tạo đối tượng ChatMessage mới với các thông tin cần thiết
        chatMessageRepository.save(chatMessage);
    }

    // Lấy Lịch Sử Cuộc Trò Chuyện
    public List<ChatMessageDTO> getConversationHistory(Long userId) {
        // Tìm tất cả tin nhắn của người dùng
        // Sắp xếp từ tin cũ đến tin mới
        List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
        
        return messages.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Chuyển Đổi Định Dạng Tin Nhắn
    // Tạo một "bản sao" với định dạng phù hợp để gửi cho giao diện người dùng
    private ChatMessageDTO convertToDTO(ChatMessage message) {
        ChatMessageDTO dto = new ChatMessageDTO();
        dto.setId(message.getId());
        dto.setUserId(message.getUserId());
        dto.setMessage(message.getMessage());
        dto.setSenderType(message.getSenderType());
        dto.setTimestamp(message.getCreatedAt());
        return dto;
    }


    // NÂNG CẤP: Prompt sanitization thông minh hơn
    // Giống như "người kiểm duyệt" lọc từ ngữ không phù hợp trong tin nhắn
    private String sanitizePrompt(String userMessage) {
        // Thay thế các từ tiêu cực/bạo lực bằng từ nhẹ nhàng hơn
        String sanitized = userMessage
            .replaceAll("(?i)\\b(kill|death|die|suicide|hurt)\\b", "stop")      // stop: dừng
            .replaceAll("(?i)\\b(drug|drugs|cocaine|heroin)\\b", "substance")   // substance: chất
            .replaceAll("(?i)\\b(hate|angry|rage|mad)\\b", "frustrated")        // frustrated: thất vọng
            .replaceAll("(?i)\\b(stupid|idiot|dumb)\\b", "difficult")           // difficult: khó khăn
            .replaceAll("(?i)\\b(damn|shit|fuck)\\b", "challenging");           // challenging: thử thách
        
        // Giới hạn độ dài để tránh token limit
        if (sanitized.length() > 1000) {
            sanitized = sanitized.substring(0, 1000) + "...";
        }
        
        return sanitized;
    }
    
    // Đếm Tin Nhắn Trong Ngày
    // Giống như "đếm số lần bạn nói chuyện với coach hôm nay"
    public long getTodayMessageCount(Long userId) {
        Calendar cal = Calendar.getInstance(); //  Lấy ngày giờ hiện tại từ máy chủ
        cal.set(Calendar.HOUR_OF_DAY, 0); // Các dòng cal.set(): Điều chỉnh thời gian thành 00:00:00.000 (đầu ngày)
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startOfDay = cal.getTime(); // Thời điểm chính xác 00:00:00 sáng nay
        
        cal.add(Calendar.DAY_OF_MONTH, 1); // Thêm 1 ngày vào thời gian hiện tại
        Date endOfDay = cal.getTime();     // Thời điểm chính xác 00:00:00 sáng ngày mai
        
        return chatMessageRepository.countTodayMessagesByUserId(userId, startOfDay, endOfDay);
    }
    
    // Phân tích tin nhắn người dùng thông minh
    // Giống như "chuyên gia tâm lý" phân tích cảm xúc và trạng thái của người dùng từ tin nhắn
    private String analyzeUserMessage(String userMessage) {
        String msg = userMessage.toLowerCase();
        List<String> insights = new ArrayList<>();
        
        // Phân tích cảm xúc
        if (msg.contains("stress") || msg.contains("căng thẳng") || msg.contains("lo lắng") || 
            msg.contains("buồn") || msg.contains("khó khăn") || msg.contains("áp lực")) {
            insights.add("Cảm xúc: Stress/Anxiety cao");
        }
        
        if (msg.contains("thèm") || msg.contains("muốn hút") || msg.contains("craving") || 
            msg.contains("nhớ thuốc") || msg.contains("khó chịu")) {
            insights.add("Trạng thái: Đang có cơn thèm");
        }
        
        if (msg.contains("tăng cân") || msg.contains("béo") || msg.contains("weight") || 
            msg.contains("cân nặng") || msg.contains("ăn nhiều")) {
            insights.add("Mối lo: Tăng cân khi cai thuốc");
        }
        
        // Phân tích thời gian
        if (msg.contains("ngày") || msg.contains("tuần") || msg.contains("tháng") || 
            msg.contains("đã cai") || msg.contains("bao lâu")) {
            insights.add("Giai đoạn: Đang theo dõi tiến trình");
        }
        
        if (msg.contains("bắt đầu") || msg.contains("cai") || msg.contains("quit") || 
            msg.contains("muốn bỏ") || msg.contains("dự định")) {
            insights.add("Ý định: Muốn bắt đầu cai thuốc");
        }
        
        // Phân tích trigger
        if (msg.contains("cafe") || msg.contains("cà phê") || msg.contains("coffee") || 
            msg.contains("uống") || msg.contains("giải lao")) {
            insights.add("Trigger: Cafe/Social smoking");
        }
        
        if (msg.contains("bạn bè") || msg.contains("party") || msg.contains("tiệc") || 
            msg.contains("nhậu") || msg.contains("gặp gỡ")) {
            insights.add("Trigger: Áp lực xã hội");
        }
        
        if (msg.contains("công việc") || msg.contains("làm việc") || msg.contains("deadline") || 
            msg.contains("họp") || msg.contains("sếp")) {
            insights.add("Trigger: Stress công việc");
        }
        
        return insights.isEmpty() ? "Tin nhắn thông thường" : String.join(", ", insights);
    }

    // Phát Hiện Xu Hướng Cuộc Trò Chuyện
    private String analyzeConversationPattern(List<ChatMessage> messages) {
        int userMessages = 0;      // Tổng số tin nhắn của người dùng
        int concernMessages = 0;   // Số tin nhắn thể hiện lo lắng/khó khăn
        int progressMessages = 0;  // Số tin nhắn thể hiện tiến triển tích cực
        int cravingMessages = 0;   // Số tin nhắn về cơn thèm thuốc
        
        // Chỉ phân tích tin nhắn của người dùng (không phải từ AI),
        // giống như bác sĩ chỉ quan tâm đến lời kể của bệnh nhân để chẩn đoán.
        for (ChatMessage msg : messages) {
            if ("USER".equals(msg.getSenderType())) {
                // Đếm tổng số tin nhắn người dùng và chuyển nội dung sang chữ thường để tìm từ khóa dễ dàng.
                userMessages++;
                String content = msg.getMessage().toLowerCase();
                
                if (content.contains("khó") || content.contains("thèm") || content.contains("stress") ||
                    content.contains("lo lắng") || content.contains("buồn")) {
                    concernMessages++;
                }
                
                if (content.contains("thèm") || content.contains("muốn hút") || content.contains("craving")) {
                    cravingMessages++;
                }
                
                if (content.contains("ngày") || content.contains("tuần") || content.contains("tốt") ||
                    content.contains("khỏe") || content.contains("thành công")) {
                    progressMessages++;
                }
            }
        }
        
        if (cravingMessages >= 2) {
            //  Nếu người dùng nhắc đến cơn thèm thuốc từ 2 lần trở lên
            // → Họ đang trong giai đoạn khó khăn, cần các kỹ thuật cụ thể để vượt qua cơn thèm (ưu tiên cao nhất).
            return "Đang gặp cơn thèm liên tục - cần hỗ trợ kỹ thuật đối phó";
        } else if (concernMessages > progressMessages) {
            // Nếu người dùng nói nhiều về khó khăn/lo lắng hơn là tiến triển tích cực
            // → Họ đang cần động viên và hỗ trợ tinh thần.
            return "Cần hỗ trợ tâm lý mạnh hơn";
        } else if (progressMessages > 0) {
            // Nếu có ít nhất một tin nhắn tích cực → Người dùng đang có tiến bộ, cần được khuyến khích tiếp tục.
            return "Đang có tiến triển tích cực";
        } else {
            // Nếu không có dấu hiệu rõ ràng → Người dùng có thể mới bắt đầu, cần được hướng dẫn cơ bản.
            return "Mới bắt đầu tương tác";
        }
    }
    
    // Báo Cáo Tiến Trình Cai Thuốc
    public String getUserProgressInsight(Long userId) {
        try {
            //  lấy tất cả các tin nhắn của người dùng 
            List<ChatMessage> allMessages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
            
            if (allMessages.isEmpty()) {
                return "Người dùng mới, chưa có lịch sử chat";
            }
            
            // Tính số ngày active
            Date firstMessage = allMessages.get(0).getCreatedAt(); // Lấy thời gian của tin nhắn đầu tiên (tin nhắn cũ nhất)
            Date lastMessage = allMessages.get(allMessages.size() - 1).getCreatedAt(); // Lấy thời gian của tin nhắn cuối cùng (tin nhắn mới nhất)
            long daysDiff = (lastMessage.getTime() - firstMessage.getTime()) / (24 * 60 * 60 * 1000); // Tính toán số ngày giữa hai thời điểm
            // lastMessage.getTime() - firstMessage.getTime() = số mili giây giữa hai thời điểm
            // Chia cho 24 * 60 * 60 * 1000 = chuyển đổi từ mili giây sang ngày
            // 24 giờ × 60 phút × 60 giây × 1000 mili giây = số mili giây trong 1 ngày
            
            // Chỉ xem xét tin nhắn của người dùng (loại bỏ tin nhắn của AI)
            long concernMessages = allMessages.stream()
                .filter(msg -> "USER".equals(msg.getSenderType()))
                .mapToLong(msg -> {
                    String content = msg.getMessage().toLowerCase(); // Chuyển nội dung thành chữ thường để dễ tìm kiếm từ khóa
                    return (content.contains("khó") || content.contains("thèm") || content.contains("stress")) ? 1 : 0; // Kiểm tra xem nội dung có chứa từ khóa tiêu cực: "khó", "thèm", "stress"
                }) // Nếu có → trả về 1, nếu không → trả về 0
                .sum(); // Tính tổng số tin nhắn thỏa điều kiện
            
            // Tương tự như đếm tin nhắn lo lắng, nhưng tìm kiếm từ khóa tích cực
            long progressMessages = allMessages.stream()
                .filter(msg -> "USER".equals(msg.getSenderType()))
                .mapToLong(msg -> {
                    String content = msg.getMessage().toLowerCase();
                    return (content.contains("tốt") || content.contains("ngày") || content.contains("thành công")) ? 1 : 0;
                })
                .sum();
            
            return String.format("Hoạt động %d ngày, Concerns: %d, Progress: %d", 
                               daysDiff, concernMessages, progressMessages);
        } catch (Exception e) {
            return "Không thể phân tích progress";
        }
    }
}
