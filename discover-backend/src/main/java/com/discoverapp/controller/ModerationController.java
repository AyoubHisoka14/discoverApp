package com.discoverapp.controller;

import com.discoverapp.repository.ChannelRepository;
import com.discoverapp.repository.MessageRepository;
import com.discoverapp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderation")
public class ModerationController {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private ReviewRepository reviewRepository;

    // TODO: Secure these endpoints for admins/moderators only

    @DeleteMapping("/message/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageRepository.deleteById(id);
    }

    @DeleteMapping("/channel/{id}")
    public void deleteChannel(@PathVariable Long id) {
        channelRepository.deleteById(id);
    }

    @DeleteMapping("/review/{id}")
    public void deleteReview(@PathVariable Long id) {
        reviewRepository.deleteById(id);
    }
} 