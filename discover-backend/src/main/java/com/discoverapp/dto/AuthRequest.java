package com.discoverapp.dto;

import lombok.Data;

//@Data is a Lombok annotation that generates boilerplate code like getUsername() and getPassword()
@Data
public class AuthRequest {
    private String username;
    private String password;
} 