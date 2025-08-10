package com.discoverapp.controller;

import com.discoverapp.security.JwtUtil;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.discoverapp.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import com.discoverapp.dto.MessageDto;
import com.discoverapp.dto.CreateMessageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/channel/{channelId}")
    public ResponseEntity<MessageDto> postMessage(@PathVariable Long channelId, @RequestBody CreateMessageRequest request) {
        String username = jwtUtil.extractUsername();
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        MessageDto message = messageService.postMessage(username, channelId, request);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/channel/{channelId}")
    public List<MessageDto> listMessages(@PathVariable Long channelId) {
        return messageService.listMessages(channelId);
    }
} 