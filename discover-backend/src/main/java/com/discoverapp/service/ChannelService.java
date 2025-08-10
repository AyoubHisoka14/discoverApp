package com.discoverapp.service;

import com.discoverapp.dto.ChannelDto;
import com.discoverapp.dto.CreateChannelRequest;
import com.discoverapp.entity.Channel;
import com.discoverapp.entity.User;
import com.discoverapp.repository.ChannelRepository;
import com.discoverapp.repository.MessageRepository;
import com.discoverapp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChannelService {
    @Autowired
    private ChannelRepository channelRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;

    public ChannelDto createChannel(String username, CreateChannelRequest dto) {
        System.out.println("Creating channel for user: " + username + ", dto: " + dto);
        
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            System.out.println("User not found: " + username);
            throw new IllegalArgumentException("User not found with UserName: " + username);
        }
        
        User creator = userOpt.get();
        System.out.println("Found user: " + creator.getUsername() + " with ID: " + creator.getId());
        
        Channel channel = Channel.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .createdBy(creator)
                .createdAt(LocalDateTime.now())
                .build();

        channelRepository.save(channel);
        System.out.println("Channel saved with ID: " + channel.getId());
        
        ChannelDto result = toDto(channel, creator);
        System.out.println("Channel DTO created: " + result);
        return result;
    }

    public void addMemberToChannel(Long channelId, String username) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getJoinedChannels().contains(channel)) {
            return; // already joined
        }

        user.getJoinedChannels().add(channel);
        userRepository.saveAndFlush(user);
    }

    public void removeMemberFromChannel(Long channelId, String username) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getJoinedChannels().contains(channel)) {
            throw new IllegalArgumentException("User is not a member of this channel");
        }

        user.getJoinedChannels().remove(channel);
        userRepository.saveAndFlush(user);
    }

    public void deleteChannel(Long id) {
        Optional<Channel> channelOpt = channelRepository.findById(id);
        if (channelOpt.isEmpty()) {
            throw new IllegalArgumentException("Channel not found with Id: " + id);
        }
        Channel channel = channelOpt.get();

        // Step 1: Clear parent message references
        messageRepository.clearParentMessagesByChannelId(id);

        // Step 2: Delete all messages in the channel
        messageRepository.deleteByChannelId(id);

        // Step 3: Clear channel members
        channelRepository.clearChannelMembers(id);

        // Step 4: Delete the channel
        channelRepository.deleteById(id);
    }

    public List<ChannelDto> listChannels(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Channel> channels = channelRepository.findAll();


        List<ChannelDto> chan = channels.stream()
                .map(channel -> toDto(channel, currentUser))
                .collect(Collectors.toList());
        return chan;
    }

    @Transactional
    public ChannelDto getChannel(Long channelId, String currentUsername) {
        Channel channel = channelRepository.findByIdWithMembers(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        User currentUser = userRepository.findByUsernameWithChannels(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is a member
        boolean isMember;
        boolean isOwner = channel.getCreatedBy() != null &&
                channel.getCreatedBy().getUsername().equals(currentUsername);
        if (channel.getMembers() != null && !channel.getMembers().isEmpty())
        {
            isMember = channel.getMembers().contains(currentUser);
        } else if (currentUser.getJoinedChannels() != null && !currentUser.getJoinedChannels().isEmpty()) {
            isMember =  currentUser.getJoinedChannels().contains(channel);
        } else {
            isMember = false;
        }

        if (!isOwner && !isMember) {
            System.out.println("Access denied - user is neither owner nor member");
            throw new IllegalArgumentException("User is not a member of this channel");
        }

        return toDto(channel, currentUser);
    }

    private ChannelDto toDto(Channel channel) {
        ChannelDto dto = new ChannelDto();
        dto.setId(channel.getId());
        dto.setName(channel.getName());
        dto.setDescription(channel.getDescription());
        dto.setCreatedAt(channel.getCreatedAt());
        dto.setCreatedById(channel.getCreatedBy() != null ? channel.getCreatedBy().getId() : null);
        dto.setCreatedByUsername(channel.getCreatedBy() != null ? channel.getCreatedBy().getUsername() : null);
        dto.setMemberCount(userRepository.countUsersByChannelId (channel.getId()));
        return dto;
    }

    private ChannelDto toDto(Channel channel, User currentUser) {
        ChannelDto dto = new ChannelDto();
        dto.setId(channel.getId());
        dto.setName(channel.getName());
        dto.setDescription(channel.getDescription());
        dto.setCreatedAt(channel.getCreatedAt());
        dto.setCreatedById(channel.getCreatedBy() != null ? channel.getCreatedBy().getId() : null);
        dto.setCreatedByUsername(channel.getCreatedBy() != null ? channel.getCreatedBy().getUsername() : null);
        if (channel.getMembers() != null && !channel.getMembers().isEmpty()) {
            dto.setMemberCount(channel.getMembers().size());
            dto.setJoined(channel.getMembers().contains(currentUser));
        } else if(currentUser.getJoinedChannels() != null && !currentUser.getJoinedChannels().isEmpty()) {
            dto.setMemberCount(userRepository.countUsersByChannelId(channel.getId()));
            dto.setJoined(currentUser.getJoinedChannels().contains(channel));
        } else {
            dto.setMemberCount(userRepository.countUsersByChannelId(channel.getId()));
            dto.setJoined(false);
        }
        return dto;
    }
} 