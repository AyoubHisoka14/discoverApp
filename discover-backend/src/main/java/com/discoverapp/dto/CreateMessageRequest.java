package com.discoverapp.dto;

import lombok.Data;

@Data
public class CreateMessageRequest {
    private String content;
    private Long parentMessageId; // Optional, for replies
} 