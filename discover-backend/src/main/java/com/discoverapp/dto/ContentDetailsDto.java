package com.discoverapp.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ContentDetailsDto {
    // Basic content information (from ContentDto)
    private Long id;
    private String title;
    private String description;
    private List<String> genreNames;
    private String posterUrl;
    private String backdropPath;
    private LocalDate release_date;
    private String trailerUrl;
    private String castList;
    private Double ratings;
    private com.discoverapp.types.ContentType type;
    private com.discoverapp.types.ContentLabel label;
    private String externalId;
    private List<String> imageUrls;
    private List<String> recommendedContentIds;
    private String trailerId;
    
    // Enhanced content details
    private List<ContentDto> recommendedContent;
} 