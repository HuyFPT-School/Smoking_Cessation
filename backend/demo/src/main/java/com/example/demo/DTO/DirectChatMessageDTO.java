package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DirectChatMessageDTO {
    private String roomId;
    private Integer senderId;
    private Integer receiverId;
    private String content;
    private String messageType;
    private String timestamp;
    private String senderName;
    private String senderAvatarUrl;
    private String senderRole;
}
