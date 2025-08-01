package com.example.demo.service;

import com.example.demo.DTO.ChatRoomDTO;
import com.example.demo.DTO.DirectChatMessageDTO;
import com.example.demo.Repo.ChatRoomRepository;
import com.example.demo.Repo.DirectChatMessageRepository;
import com.example.demo.Repo.UserRepository;
import com.example.demo.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class DirectChatService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    @Autowired
    private DirectChatMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public ChatRoomDTO createOrGetChatRoom(Integer memberId, Integer coachId) {
        // Check if room already exists
        Optional<ChatRoom> existingRoom = chatRoomRepository.findActiveRoomBetweenUsers(memberId, coachId);
        
        if (existingRoom.isPresent()) {
            return convertToDTO(existingRoom.get());
        }

        // Create new room
        User member = userRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        User coach = userRepository.findById(coachId)
                .orElseThrow(() -> new RuntimeException("Coach not found"));

        ChatRoom chatRoom = new ChatRoom();
        chatRoom.setRoomId(generateRoomId(memberId, coachId));
        chatRoom.setMember(member);
        chatRoom.setCoach(coach);
        chatRoom.setActive(true);

        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);
        return convertToDTO(savedRoom);
    }

    public DirectChatMessageDTO saveMessage(DirectChatMessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(messageDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        DirectChatMessage message = new DirectChatMessage();
        message.setRoomId(messageDTO.getRoomId());
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(messageDTO.getContent());
        message.setMessageType(MessageType.valueOf(messageDTO.getMessageType().toUpperCase()));

        DirectChatMessage savedMessage = messageRepository.save(message);

        // Update room's updated_at
        Optional<ChatRoom> room = chatRoomRepository.findByRoomId(messageDTO.getRoomId());
        if (room.isPresent()) {
            room.get().setUpdatedAt(LocalDateTime.now());
            chatRoomRepository.save(room.get());
        }

        return convertMessageToDTO(savedMessage);
    }

    public List<DirectChatMessageDTO> getRoomMessages(String roomId) {
        List<DirectChatMessage> messages = messageRepository.findByRoomIdOrderByTimestampAsc(roomId);
        return messages.stream()
                .map(this::convertMessageToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatRoomDTO> getUserChatRooms(Integer userId) {
        List<ChatRoom> rooms = chatRoomRepository.findActiveRoomsForUser(userId);
        return rooms.stream()
                .map(room -> {
                    ChatRoomDTO dto = convertToDTO(room);
                    // Add unread count
                    int unreadCount = messageRepository.countUnreadMessagesInRoom(room.getRoomId(), userId);
                    dto.setUnreadCount(unreadCount);
                    
                    // Add last message
                    DirectChatMessage lastMessage = messageRepository.findLastMessageInRoom(room.getRoomId());
                    if (lastMessage != null) {
                        dto.setLastMessage(lastMessage.getContent());
                        dto.setLastMessageTime(lastMessage.getTimestamp().format(DateTimeFormatter.ofPattern("HH:mm")));
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public void markMessagesAsRead(String roomId, Integer userId) {
        List<DirectChatMessage> unreadMessages = messageRepository.findByRoomIdOrderByTimestampAsc(roomId)
                .stream()
                .filter(msg -> Objects.equals(msg.getReceiver().getId(), userId) && !msg.isRead())
                .collect(Collectors.toList());

        unreadMessages.forEach(msg -> msg.setRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    private String generateRoomId(Integer memberId, Integer coachId) {
        return "room_" + Math.min(memberId, coachId) + "_" + Math.max(memberId, coachId);
    }

    private ChatRoomDTO convertToDTO(ChatRoom room) {
        ChatRoomDTO dto = new ChatRoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setMemberId(room.getMember().getId());
        dto.setCoachId(room.getCoach().getId());
        dto.setMemberName(room.getMember().getName());
        dto.setCoachName(room.getCoach().getName());
        dto.setMemberAvatarUrl(room.getMember().getAvatarUrl());
        dto.setCoachAvatarUrl(room.getCoach().getAvatarUrl());
        dto.setActive(room.isActive());
        return dto;
    }

    private DirectChatMessageDTO convertMessageToDTO(DirectChatMessage message) {
        DirectChatMessageDTO dto = new DirectChatMessageDTO();
        dto.setRoomId(message.getRoomId());
        dto.setSenderId(message.getSender().getId());
        dto.setReceiverId(message.getReceiver().getId());
        dto.setContent(message.getContent());
        dto.setMessageType(message.getMessageType().toString());
        dto.setTimestamp(message.getTimestamp().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        dto.setSenderName(message.getSender().getName());
        dto.setSenderAvatarUrl(message.getSender().getAvatarUrl());
        dto.setSenderRole(message.getSender().getRole().toString());
        return dto;
    }
}
