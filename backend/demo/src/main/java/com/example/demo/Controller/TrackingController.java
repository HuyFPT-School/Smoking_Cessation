package com.example.demo.Controller;

import com.example.demo.DTO.TrackingDTO;
import com.example.demo.entity.Tracking;
import com.example.demo.entity.User;
import com.example.demo.Repo.TrackingRepo;
import com.example.demo.Repo.UserRepo;
import com.example.demo.utils.DataUpdatedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    @Autowired
    private TrackingRepo trackingRepo;

    @Autowired
    private UserRepo userRepo; // Assuming you have a UserRepo

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @PostMapping
    public ResponseEntity<?> createTracking(@RequestBody TrackingDTO trackingDTO) {
        Optional<User> userOptional = userRepo.findById(Integer.valueOf(trackingDTO.getUserId()));
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }

        Tracking tracking = new Tracking();
        tracking.setDate(trackingDTO.getDate());
        tracking.setTime(trackingDTO.getTime());
        tracking.setLocation(trackingDTO.getLocation());
        tracking.setTrigger_value(trackingDTO.getTrigger()); // Ensure this matches the entity field name
        tracking.setSatisfaction(trackingDTO.getSatisfaction());
        tracking.setType(trackingDTO.getType());
        tracking.setNotes(trackingDTO.getNotes());
        tracking.setUser(userOptional.get());

        Tracking savedTracking = trackingRepo.save(tracking);
        eventPublisher.publishEvent(new DataUpdatedEvent(this, Integer.valueOf(trackingDTO.getUserId())));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedTracking));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTrackingByUserId(@PathVariable String userId) {
        try {
            int id = userId != null ? Integer.parseInt(userId) : 0;
            List<Tracking> trackings = trackingRepo.findByUserId(id);
            if (trackings.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No tracking data found for this user.");
            }
            List<TrackingDTO> trackingDTOs = trackings.stream().map(this::toDTO).collect(Collectors.toList());
            return ResponseEntity.ok(trackingDTOs);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        }
    }

    private TrackingDTO toDTO(Tracking tracking) {
        TrackingDTO dto = new TrackingDTO();
        dto.setDate(tracking.getDate());
        dto.setTime(tracking.getTime());
        dto.setLocation(tracking.getLocation());
        dto.setTrigger(tracking.getTrigger_value());
        dto.setSatisfaction(tracking.getSatisfaction());
        dto.setType(tracking.getType());
        dto.setNotes(tracking.getNotes());
        if (tracking.getUser() != null) {
            dto.setUserId(String.valueOf(tracking.getUser().getId()));
        }
        return dto;
    }
}
