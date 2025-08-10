package com.discoverapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WatchlistItemDto {
    private Long id;
    private Long userId;
    private Long contentId;
    private ContentDto content;
    private String status;
    private LocalDateTime addedAt;
} 