package com.discoverapp.dto;

import lombok.Data;

@Data
public class CreateReviewRequest {
    private Long movieId;
    private Double rating;
    private String reviewText;
}
