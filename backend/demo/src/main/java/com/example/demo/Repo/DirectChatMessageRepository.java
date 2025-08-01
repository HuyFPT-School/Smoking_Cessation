package com.example.demo.Repo;

import com.example.demo.entity.DirectChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectChatMessageRepository extends JpaRepository<DirectChatMessage, Long> {
    
    @Query("SELECT dcm FROM DirectChatMessage dcm WHERE dcm.roomId = :roomId ORDER BY dcm.timestamp ASC")
    List<DirectChatMessage> findByRoomIdOrderByTimestampAsc(@Param("roomId") String roomId);
    
    @Query("SELECT dcm FROM DirectChatMessage dcm WHERE dcm.roomId = :roomId ORDER BY dcm.timestamp DESC")
    List<DirectChatMessage> findByRoomIdOrderByTimestampDesc(@Param("roomId") String roomId);
    
    @Query("SELECT COUNT(dcm) FROM DirectChatMessage dcm WHERE dcm.roomId = :roomId AND dcm.receiver.id = :userId AND dcm.isRead = false")
    int countUnreadMessagesInRoom(@Param("roomId") String roomId, @Param("userId") Integer userId);
    
    @Query("SELECT dcm FROM DirectChatMessage dcm WHERE dcm.roomId = :roomId ORDER BY dcm.timestamp DESC LIMIT 1")
    DirectChatMessage findLastMessageInRoom(@Param("roomId") String roomId);
}
