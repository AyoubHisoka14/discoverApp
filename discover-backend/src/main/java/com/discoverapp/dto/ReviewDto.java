package com.discoverapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long id;
    private Long userId;
    private Long contentId;
    private Double rating;
    private String reviewText;
    private LocalDateTime createdAt;
} 