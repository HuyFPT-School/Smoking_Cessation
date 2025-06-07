package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private int id;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "birthdate", length = 15)
    private String birthdate; // DD/MM/YYYY format

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "smoking_age")
    private Integer smokingAge;

    @Column(name = "years_smoked")
    private Integer yearsSmoked;

    @Column(name = "occupation", length = 100)
    private String occupation;

    @Column(name = "health_status", length = 50)
    private String healthStatus;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}
