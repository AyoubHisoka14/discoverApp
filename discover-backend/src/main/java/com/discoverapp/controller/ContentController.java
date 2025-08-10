package com.discoverapp.controller;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.discoverapp.dto.ContentDto;
import com.discoverapp.service.ContentService;
import com.discoverapp.types.ContentType;
import org.springframework.beans.factory.annotation.Autowired;
import com.discoverapp.dto.ContentDetailsDto;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    @Autowired
    private ContentService contentService;

    @GetMapping("/{id}")
    public ContentDto getContent(@PathVariable Long id) {
        return contentService.getContent(id);
    }

    @GetMapping("/external/{externalId}")
    public ContentDto getContentByExternalId(@PathVariable String externalId, @RequestParam ContentType type) {
        return contentService.getContentByExternalId(externalId, type);
    }

    @GetMapping("/search/{contentType}")
    public List<ContentDto> searchContent(@RequestParam String query, @PathVariable ContentType contentType) {
        return contentService.searchContent(contentType, query);
    }

    @GetMapping("/movies")
    public List<ContentDto> getAllMovies() {
        return contentService.getContentByType(ContentType.MOVIE);
    }

    @GetMapping("/series")
    public List<ContentDto> getAllSeries() {
        return contentService.getContentByType(ContentType.SERIES);
    }

    @GetMapping("/anime")
    public List<ContentDto> getAllAnime() {
        return contentService.getContentByType(ContentType.ANIME);
    }

    @GetMapping("/trending/{contentType}")
    public List<ContentDto> trendingContent(@PathVariable ContentType contentType) {
        return contentService.getTrendingContent(contentType);
    }

    @GetMapping("/details/{externalId}")
    public ContentDetailsDto getContentDetails(@PathVariable String externalId, @RequestParam ContentType type) {
        return contentService.getContentDetails(externalId, type);
    }
} 