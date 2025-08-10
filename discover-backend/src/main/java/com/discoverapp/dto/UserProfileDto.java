package com.discoverapp.dto;

import lombok.Data;
import java.util.Set;

@Data
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private String preferences;
    private String profileInfo;
    private String bio;
    private String avatar;
} 