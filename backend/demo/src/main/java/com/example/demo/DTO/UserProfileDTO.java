package com.example.demo.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserProfileDTO {
    private String avatarUrl;
    private String name; // From User entity
    private String phone;
    private String birthdate; // DD/MM/YYYY format
    private String gender;
    private String bio;
    private Integer smokingAge;
    private Integer yearsSmoked;
    private String occupation;
    private String healthStatus;
    private Integer userId; // To link with the User
}
