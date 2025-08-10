package com.discoverapp.service;

import com.discoverapp.dto.CreateMessageRequest;
import com.discoverapp.dto.MessageDto;
import com.discoverapp.entity.Channel;
import com.discoverapp.entity.Message;
import com.discoverapp.entity.User;
import com.discoverapp.repository.ChannelRepository;
import com.discoverapp.repository.MessageRepository;
import com.discoverapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private UserRepository userRepository;

    public MessageDto postMessage(String username, Long channelId, CreateMessageRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        Optional<Channel> channelOpt = channelRepository.findById(channelId);
        
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with UserName: " + username);
        }
        if (channelOpt.isEmpty()) {
            throw new IllegalArgumentException("Channel not found with ID: " + channelId);
        }

        Message parentMessage = null;
        if (request.getParentMessageId() != null) {
            parentMessage = messageRepository.findById(request.getParentMessageId())
                    .orElseThrow(() -> new IllegalArgumentException("Parent message not found with ID: " + request.getParentMessageId()));
        }

        Message message = Message.builder()
                .channel(channelOpt.get())
                .user(userOpt.get())
                .content(request.getContent())
                .parentMessage(parentMessage)
                .createdAt(LocalDateTime.now())
                .moderated(false)
                .build();
        messageRepository.save(message);
        return toDto(message);
    }

    public List<MessageDto> listMessages(Long channelId) {
        return messageRepository.findAll().stream()
                .filter(m -> m.getChannel() != null && m.getChannel().getId().equals(channelId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private MessageDto toDto(Message message) {
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setChannelId(message.getChannel() != null ? message.getChannel().getId() : null);
        dto.setUserId(message.getUser() != null ? message.getUser().getId() : null);
        dto.setUsername(message.getUser() != null ? message.getUser().getUsername() : null);
        dto.setContent(message.getContent());
        dto.setParentMessageId(message.getParentMessage() != null ? message.getParentMessage().getId() : null);
        dto.setCreatedAt(message.getCreatedAt());
        dto.setModerated(message.isModerated());
        return dto;
    }
} 