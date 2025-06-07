package com.example.demo.Controller;

import com.example.demo.DTO.UserProfileDTO;
import com.example.demo.entity.User;
import com.example.demo.entity.UserProfile;
import com.example.demo.Repo.UserProfileRepo;
import com.example.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class ProfileController {

    @Autowired
    private UserProfileRepo userProfileRepo;

    @Autowired
    private UserRepo userRepo;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable String userId) {
        try {
            int id = userId != null ? Integer.parseInt(userId) : 0;
            Optional<UserProfile> userProfileOptional = userProfileRepo.findByUserId(id);

            if (userProfileOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No profile found for this user.");
            }

            UserProfileDTO profileDTO = toDTO(userProfileOptional.get());
            return ResponseEntity.ok(profileDTO);
        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrUpdateProfile(@RequestBody UserProfileDTO profileDTO) {
        try {
            int userId = Integer.parseInt(profileDTO.getUserId());
            Optional<User> userOptional = userRepo.findById(userId);

            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
            }

            User user = userOptional.get();

            // Update user name if provided
            if (profileDTO.getName() != null && !profileDTO.getName().trim().isEmpty()) {
                user.setName(profileDTO.getName());
                userRepo.save(user);
            }

            // Check if profile already exists
            Optional<UserProfile> existingProfileOptional = userProfileRepo.findByUserId(userId);
            UserProfile userProfile;

            if (existingProfileOptional.isPresent()) {
                // Update existing profile
                userProfile = existingProfileOptional.get();
            } else {
                // Create new profile
                userProfile = new UserProfile();
                userProfile.setUser(user);
            }

            // Update profile fields
            userProfile.setPhone(profileDTO.getPhone());
            userProfile.setBirthdate(profileDTO.getBirthdate());
            userProfile.setGender(profileDTO.getGender());
            userProfile.setBio(profileDTO.getBio());
            userProfile.setSmokingAge(profileDTO.getSmokingAge());
            userProfile.setYearsSmoked(profileDTO.getYearsSmoked());
            userProfile.setOccupation(profileDTO.getOccupation());
            userProfile.setHealthStatus(profileDTO.getHealthStatus());

            UserProfile savedProfile = userProfileRepo.save(userProfile);
            return ResponseEntity.ok(toDTO(savedProfile));

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error saving profile: " + e.getMessage());
        }
    }

    private UserProfileDTO toDTO(UserProfile userProfile) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setName(userProfile.getUser().getName());
        dto.setPhone(userProfile.getPhone());
        dto.setBirthdate(userProfile.getBirthdate());
        dto.setGender(userProfile.getGender());
        dto.setBio(userProfile.getBio());
        dto.setSmokingAge(userProfile.getSmokingAge());
        dto.setYearsSmoked(userProfile.getYearsSmoked());
        dto.setOccupation(userProfile.getOccupation());
        dto.setHealthStatus(userProfile.getHealthStatus());
        dto.setUserId(String.valueOf(userProfile.getUser().getId()));
        return dto;
    }
}
