package com.example.demo.Controller;

import com.example.demo.DTO.ChatRoomDTO;
import com.example.demo.DTO.DirectChatMessageDTO;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.service.DirectChatService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/direct-chat")
@CrossOrigin(origins = "http://localhost:3000")
public class DirectChatController {

    @Autowired
    private DirectChatService directChatService;

    @Autowired
    private UserService userService;

    @GetMapping("/rooms/{userId}")
    public ResponseEntity<List<ChatRoomDTO>> getUserChatRooms(@PathVariable Integer userId) {
        try {
            List<ChatRoomDTO> rooms = directChatService.getUserChatRooms(userId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/rooms/create")
    public ResponseEntity<ChatRoomDTO> createOrGetChatRoom(
            @RequestParam Integer memberId,
            @RequestParam Integer coachId) {
        try {
            ChatRoomDTO room = directChatService.createOrGetChatRoom(memberId, coachId);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/messages/{roomId}")
    public ResponseEntity<List<DirectChatMessageDTO>> getRoomMessages(@PathVariable String roomId) {
        try {
            List<DirectChatMessageDTO> messages = directChatService.getRoomMessages(roomId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/coaches")
    public ResponseEntity<List<User>> getAvailableCoaches() {
        try {
            List<User> coaches = userService.getUsersByRole(Role.COACH);
            return ResponseEntity.ok(coaches);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/messages/mark-read")
    public ResponseEntity<Void> markMessagesAsRead(
            @RequestParam String roomId,
            @RequestParam Integer userId) {
        try {
            directChatService.markMessagesAsRead(roomId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
