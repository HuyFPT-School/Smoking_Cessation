package com.example.demo.DTO;

import lombok.Data;

@Data
public class ChatRequestDTO {
    private Long userId;
    private String message;
    
    public ChatRequestDTO() {}
    
    public ChatRequestDTO(Long userId, String message) {
        this.userId = userId;
        this.message = message;
    }
}
