package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity // Báo cho hệ thống biết class này đại diện cho một bảng trong database
@Table(name = "user_profile") // Chỉ định tên bảng trong database là "user_profile"
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

    @OneToOne // Mối quan hệ 1-1 (mỗi User có đúng 1 UserProfile)
    @JoinColumn(name = "user_id", unique = true) // Kết nối thông qua cột "user_id" unique = true: Đảm bảo mỗi User chỉ có 1 Profile
    private User user;
}
