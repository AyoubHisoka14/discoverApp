package com.discoverapp.initializer;

import com.discoverapp.entity.Content;
import com.discoverapp.entity.User;
import com.discoverapp.repository.ContentRepository;
import com.discoverapp.repository.UserRepository;
import com.discoverapp.types.ContentType;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Set;

@Component
public class DataInitializer {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void init() {
        // Create test user if it doesn't exist
        if (userRepository.findByUsername("testuser").isEmpty()) {
            User testUser = User.builder()
                    .username("testuser")
                    .email("testuser@example.com")
                    .password(passwordEncoder.encode("password"))
                    .roles(Set.of("ROLE_USER"))
                    .build();
            userRepository.save(testUser);
            System.out.println("Created test user: testuser/password");
        }

    }
} 