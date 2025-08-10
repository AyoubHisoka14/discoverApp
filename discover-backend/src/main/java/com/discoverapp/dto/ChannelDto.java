package com.discoverapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChannelDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private Long createdById;
    private String createdByUsername;
    private int memberCount;
    private boolean joined; // true if the current user is a member
} 