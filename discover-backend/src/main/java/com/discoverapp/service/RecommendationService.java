package com.discoverapp.service;

import com.discoverapp.dto.ContentDto;
import com.discoverapp.dto.RecommendationRequest;
import com.discoverapp.entity.RecommendationLog;
import com.discoverapp.external.GeminiClient;
import com.discoverapp.repository.ContentRepository;
import com.discoverapp.repository.RecommendationLogRepository;
import com.discoverapp.types.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecommendationService {
    @Autowired
    private GeminiClient geminiClient;
    @Autowired
    private ContentRepository contentRepository;
    @Autowired
    private RecommendationLogRepository recommendationLogRepository;
    @Autowired
    private ContentService contentService;

    /**
     * Recommend content using Gemini API. User must pick one content type. For each title from Gemini, search TMDB or Jikan, save if not in DB, and return ContentDto list.
     */
    public List<ContentDto> recommend(RecommendationRequest dto) {
        if (dto.getContentType() == null) {
            throw new IllegalArgumentException("You must pick one content type.");
        }
        ContentType type = dto.getContentType();
        // Get titles from Gemini
        List<String> titles = geminiClient.getRecommendations(dto.getDescription(), type);
        List<ContentDto> results = new java.util.ArrayList<>();
        for (String title : titles) {
            List<ContentDto> found;
            if (type == ContentType.ANIME) {
                found = contentService.searchContent(ContentType.ANIME, title);
            } else {
                found = contentService.searchContent(type, title);
            }

            if (found.isEmpty()) {
                continue;
            }
            ContentDto dtoItem = found.get(0);
            // Check if exists in DB by externalId and type
            boolean exists = contentService.contentRepository.findAll().stream()
                .anyMatch(c -> c.getExternalId() != null && c.getExternalId().equals(dtoItem.getExternalId()) && c.getType() == type);
            if (!exists) {
                contentService.contentRepository.save(contentService.fromDto(dtoItem));
            }
            results.add(dtoItem);

        }
        // Log the recommendation
        RecommendationLog log = RecommendationLog.builder()
                .user(null)
                .inputDescription(dto.getDescription())
                .recommendedTitles(String.join(", ", titles))
                .createdAt(LocalDateTime.now())
                .build();

        recommendationLogRepository.save(log);
        return results;
    }
} 