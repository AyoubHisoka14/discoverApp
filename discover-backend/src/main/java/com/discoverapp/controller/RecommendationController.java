package com.discoverapp.controller;

import com.discoverapp.dto.ContentDto;
import com.discoverapp.dto.RecommendationRequest;
import com.discoverapp.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {
    @Autowired
    private RecommendationService recommendationService;

    /**
     * POST /api/recommendations
     * Accepts a description and returns a list of recommended ContentDto using AI/database.
     */
    @PostMapping
    public List<ContentDto> recommend(@RequestBody RecommendationRequest request) {
        return recommendationService.recommend(request);
    }
} 