package com.discoverapp.controller;

import com.discoverapp.dto.AuthRequest;
import com.discoverapp.dto.AuthResponse;
import com.discoverapp.entity.User;
import com.discoverapp.repository.UserRepository;
import com.discoverapp.security.CustomUserDetailsService;
import com.discoverapp.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

//Combines @Controller and @ResponseBody
//Tells Spring: "This class handles HTTP requests, and all methods return JSON (not views)."
@RestController

//Sets the base path for all endpoints in this controller to /api/auth So @PostMapping("/login") becomes /api/auth/login
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private CustomUserDetailsService userDetailsService;

    @PostMapping("/register")
    public String register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return "Username already exists";
        }
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getUsername() + "@mock.com")
                .password(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("ROLE_USER"))
                .build();
        userRepository.save(user);
        return "Registered";
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getUsername(), user.getId());
        return new AuthResponse(token);
    }
} 