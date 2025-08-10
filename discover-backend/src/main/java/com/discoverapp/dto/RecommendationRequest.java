package com.discoverapp.dto;

import com.discoverapp.types.ContentType;
import lombok.Data;

@Data
public class RecommendationRequest {
    private String description;
    private ContentType contentType;
}
