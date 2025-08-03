package com.example.demo.Repo;

import com.example.demo.entity.ChatRoom;
import com.example.demo.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    
    @Query("SELECT cr FROM ChatRoom cr WHERE (cr.member.id = :userId OR cr.coach.id = :userId) AND cr.isActive = true ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findActiveRoomsForUser(@Param("userId") Integer userId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE ((cr.member.id = :memberId AND cr.coach.id = :coachId) OR (cr.member.id = :coachId AND cr.coach.id = :memberId)) AND cr.isActive = true")
    Optional<ChatRoom> findActiveRoomBetweenUsers(@Param("memberId") Integer memberId, @Param("coachId") Integer coachId);
    
    Optional<ChatRoom> findByRoomId(String roomId);
    
    @Query("SELECT cr FROM ChatRoom cr WHERE cr.coach.id = :coachId AND cr.isActive = true ORDER BY cr.updatedAt DESC")
    List<ChatRoom> findActiveRoomsForCoach(@Param("coachId") Integer coachId);
    
    // Delete all chat rooms where user is member or coach
    @Modifying
    @Query("DELETE FROM ChatRoom cr WHERE cr.member.id = :userId OR cr.coach.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
}
