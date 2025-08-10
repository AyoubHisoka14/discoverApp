package com.discoverapp.controller;

import com.discoverapp.security.JwtUtil;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.discoverapp.service.ChannelService;
import org.springframework.beans.factory.annotation.Autowired;
import com.discoverapp.dto.ChannelDto;
import com.discoverapp.dto.CreateChannelRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/channels")
public class ChannelController {
    @Autowired
    private ChannelService channelService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/create")
    public ResponseEntity<ChannelDto> createChannel(@RequestBody CreateChannelRequest request) {
        String username = jwtUtil.extractUsername();
        System.out.println("Create channel request - username: " + username + ", request: " + request);
        
        if (username == null) {
            System.out.println("Username is null - unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
        ChannelDto channel = channelService.createChannel(username, request);
            System.out.println("Channel created successfully: " + channel);
        return ResponseEntity.ok(channel);
        } catch (Exception e) {
            System.out.println("Error creating channel: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/delete/{channelId}")
    public ResponseEntity<Void> deleteChannel(@PathVariable Long channelId) {
        String username = jwtUtil.extractUsername();
        System.out.println("Delete channel request - username: " + username + ", channelId: " + channelId);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            channelService.deleteChannel(channelId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("Error deleting channel: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/join/{channelId}")
    public ResponseEntity<Void> joinChannel(@PathVariable Long channelId) {
        String username = jwtUtil.extractUsername();
        System.out.println("Join channel request - username: " + username + ", channelId: " + channelId);
        System.out.println("Authentication: " + SecurityContextHolder.getContext().getAuthentication());

        if (username == null) {
            System.out.println("Username is null - unauthorized");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            channelService.addMemberToChannel(channelId, username);
            System.out.println("Successfully joined channel " + channelId + " as " + username);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            System.out.println("Error joining channel: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/leave/{channelId}")
    public ResponseEntity<String> leaveChannel(@PathVariable Long channelId) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            channelService.removeMemberFromChannel(channelId, username);
            return ResponseEntity.ok("Left channel successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping
    public List<ChannelDto> listChannels() {
        String username = jwtUtil.extractUsername();
        return channelService.listChannels(username);
    }

    @GetMapping("/{channelId}")
    public ResponseEntity<ChannelDto> getChannel(@PathVariable Long channelId) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            ChannelDto channel = channelService.getChannel(channelId, username);
            return ResponseEntity.ok(channel);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
} 