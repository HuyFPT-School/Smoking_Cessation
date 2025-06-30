package com.example.demo.DTO;

import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminUserDTO {
    private int id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String avatarUrl;


    public AdminUserDTO(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.phone = ""; // Gán sau nếu cần
        this.avatarUrl = user.getAvatarUrl();

    }

}
