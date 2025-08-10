package com.discoverapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageDto {
    private Long id;
    private Long channelId;
    private Long userId;
    private String username;
    private String content;
    private Long parentMessageId;
    private LocalDateTime createdAt;
    private boolean moderated;
} 