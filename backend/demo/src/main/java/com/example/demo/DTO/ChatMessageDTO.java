package com.example.demo.DTO;

import lombok.Data;
import java.util.Date;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long userId;
    private String message;
    private String senderType; // "USER" or "AI"
    private Date timestamp;
    
    public ChatMessageDTO() {
        this.timestamp = new Date();
    }
    
    public ChatMessageDTO(String message, String senderType) {
        this.message = message;
        this.senderType = senderType;
        this.timestamp = new Date();
    }
}
