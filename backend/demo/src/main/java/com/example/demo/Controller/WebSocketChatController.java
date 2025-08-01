package com.example.demo.Controller;

import com.example.demo.DTO.DirectChatMessageDTO;
import com.example.demo.service.DirectChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private DirectChatService directChatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload DirectChatMessageDTO chatMessage) {
        try {
            // Save message to database
            DirectChatMessageDTO savedMessage = directChatService.saveMessage(chatMessage);
            
            // Send message to specific room
            messagingTemplate.convertAndSend(
                "/topic/room/" + chatMessage.getRoomId(), 
                savedMessage
            );
            
            // Send notification to receiver
            messagingTemplate.convertAndSend(
                "/topic/user/" + chatMessage.getReceiverId() + "/notifications",
                savedMessage
            );
            
        } catch (Exception e) {
            e.printStackTrace();
            // Send error message back to sender
            messagingTemplate.convertAndSend(
                "/topic/user/" + chatMessage.getSenderId() + "/errors",
                "Failed to send message: " + e.getMessage()
            );
        }
    }

    @MessageMapping("/chat.joinRoom")
    public void joinRoom(@Payload String roomId) {
        // Mark messages as read when user joins room
        // This will be handled by the service
    }

    @MessageMapping("/chat.markAsRead")
    public void markAsRead(@Payload DirectChatMessageDTO messageInfo) {
        try {
            directChatService.markMessagesAsRead(messageInfo.getRoomId(), messageInfo.getReceiverId());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
