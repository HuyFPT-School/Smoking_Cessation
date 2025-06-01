package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
@Table(name = "user")
public class User {
    @Id
    @Column(name = "user_id", length = 45)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    @Column(name = "user_name", length = 255)
    private String name;
    @Column(name = "email", length = 255, unique = true)
    private String email;
    @Column(name = "password", length = 255)
    private String password;
    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;
    @Column(name = "create_at")
    private LocalDateTime createAt;


}
