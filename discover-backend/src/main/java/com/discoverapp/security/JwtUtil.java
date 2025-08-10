package com.discoverapp.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    public String generateToken(String username, Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String username) {
        // For backward compatibility, generate token without userId
        return generateToken(username, null);
    }

    public String getUsernameFromToken(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public Long getUserIdFromToken(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Claims claims = Jwts.parserBuilder().setSigningKey(key).build()
                    .parseClaimsJws(token).getBody();
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extractUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Extracting username - Authentication: " + auth);
        
        if (auth == null || !auth.isAuthenticated()) {
            System.out.println("Authentication is null or not authenticated");
            return null;
        }

        // Extracts the actual User object from the Authentication object.
        String username = ((User) auth.getPrincipal()).getUsername();
        System.out.println("Extracted username: " + username);
        return username;
    }

    public Long extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }

        // Try to get userId from the principal if it's our custom User entity
        if (auth.getPrincipal() instanceof com.discoverapp.entity.User) {
            return ((com.discoverapp.entity.User) auth.getPrincipal()).getId();
        }

        // Fallback: try to extract from JWT token in request
        try {
            String token = extractTokenFromRequest();
            if (token != null) {
                return getUserIdFromToken(token);
            }
        } catch (Exception e) {
            // Ignore errors
        }

        return null;
    }

    private String extractTokenFromRequest() {
        // This is a simplified version - in a real app you'd get this from the request context
        return null;
    }
} 