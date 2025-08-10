package com.discoverapp.dto;

import com.discoverapp.types.ContentLabel;
import com.discoverapp.types.ContentType;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ContentDto {
    private Long id;
    private String title;
    private String description;
    private List<Long> genreIds;
    private List<String> genreNames;
    private String posterUrl;
    private String backdropPath;
    private String trailerUrl;
    private LocalDate release_date;
    private String castList;
    private Double ratings;
    private ContentType type;
    private ContentLabel label;
    private String externalId;
    
    // New fields for enhanced content details
    private List<String> imageUrls;
    private List<String> recommendedContentIds;
    private String trailerId;
} 