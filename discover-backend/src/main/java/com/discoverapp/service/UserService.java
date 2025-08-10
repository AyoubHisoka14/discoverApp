package com.discoverapp.service;

import com.discoverapp.dto.UserProfileDto;
import com.discoverapp.entity.User;
import com.discoverapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(this::toDto).orElse(null);
    }

    public UserProfileDto updateUserProfile(Long userId, UserProfileDto dto) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return null;
        User user = userOpt.get();
        
        // Update fields if provided
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            user.setUsername(dto.getUsername());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }
        if (dto.getAvatar() != null) {
            user.setAvatar(dto.getAvatar());
        }
        if (dto.getPreferences() != null) {
            user.setPreferences(dto.getPreferences());
        }
        if (dto.getProfileInfo() != null) {
            user.setProfileInfo(dto.getProfileInfo());
        }
        
        userRepository.save(user);
        return toDto(user);
    }

    private UserProfileDto toDto(User user) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRoles(user.getRoles());
        dto.setPreferences(user.getPreferences());
        dto.setProfileInfo(user.getProfileInfo());
        dto.setBio(user.getBio());
        dto.setAvatar(user.getAvatar());
        return dto;
    }
} 