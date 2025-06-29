package com.example.demo.DTO;

import com.example.demo.entity.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private Integer id;
    private String name;
    private String email;
    private String avatarUrl;
    private Role role;
}
