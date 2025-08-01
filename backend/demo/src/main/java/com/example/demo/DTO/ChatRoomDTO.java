package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomDTO {
    private String roomId;
    private Integer memberId;
    private Integer coachId;
    private String memberName;
    private String coachName;
    private String memberAvatarUrl;
    private String coachAvatarUrl;
    private String lastMessage;
    private String lastMessageTime;
    private boolean isActive;
    private int unreadCount;
}
