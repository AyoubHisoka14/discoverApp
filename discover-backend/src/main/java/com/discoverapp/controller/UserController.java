package com.discoverapp.controller;

import com.discoverapp.dto.UserProfileDto;
import com.discoverapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/{userId}/profile")
    public UserProfileDto getProfile(@PathVariable Long userId) {
        return userService.getUserProfile(userId);
    }

    @PutMapping("/{userId}/profile")
    public UserProfileDto updateProfile(@PathVariable Long userId, @RequestBody UserProfileDto dto) {
        return userService.updateUserProfile(userId, dto);
    }
} 