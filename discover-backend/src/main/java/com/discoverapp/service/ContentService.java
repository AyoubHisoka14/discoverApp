package com.discoverapp.service;

import com.discoverapp.dto.ContentDto;
import com.discoverapp.entity.Content;
import com.discoverapp.entity.FetchLog;
import com.discoverapp.entity.Genre;
import com.discoverapp.repository.FetchLogRepository;
import com.discoverapp.repository.GenreRepository;
import com.discoverapp.types.ContentLabel;
import com.discoverapp.types.ContentType;
import com.discoverapp.external.JikanClient;
import com.discoverapp.external.TmdbClient;
import com.discoverapp.repository.ContentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import com.discoverapp.dto.ContentDetailsDto;

@Service
public class ContentService {
    @Autowired
    public ContentRepository contentRepository;
    @Autowired
    public GenreRepository genreRepository;
    @Autowired
    public FetchLogRepository fetchLogRepository;
    @Autowired
    private TmdbClient tmdbClient;
    @Autowired
    private JikanClient jikanClient;

    Duration ttl = Duration.ofHours(12);

    public ContentDto getContent(Long id) {
        Optional<Content> contentOpt = contentRepository.findById(id);
        if (contentOpt.isPresent()) {
            return toDto(contentOpt.get());
        }
        return null;
    }

    public ContentDto getContentByExternalId(String externalId, ContentType type) {
        Optional<Content> contentOpt = contentRepository.findAll().stream()
                .filter(m -> externalId.equals(m.getExternalId()) && type.equals(m.getType()))
                .findFirst();
        if (contentOpt.isPresent()) {
            return toDto(contentOpt.get());
        }
        ContentDto dto = null;
        if (ContentType.ANIME.equals(type)) {
            dto = jikanClient.fetchAnimeDetails(externalId);
        } else {
            dto = tmdbClient.fetchMovieDetails(externalId);
        }
        if (dto != null) {
            Content content = fromDto(dto);
            contentRepository.save(content);
            return dto;
        }
        return null;
    }

    public List<ContentDto> getContentByType(ContentType type) {
        LocalDateTime now = LocalDateTime.now();

        // Unique key for this fetch purpose + type
        String fetchKey = "DISCOVER_" + type.name();

        // Check if we recently fetched this type
        Optional<FetchLog> fetchLog = fetchLogRepository.findById(fetchKey);
        boolean isRecentFetch = fetchLog
                .map(log -> log.getLastFetchedAt().isAfter(now.minus(ttl)))
                .orElse(false);

        // If TTL is valid, return all existing content of that type
        if (isRecentFetch) {
            return contentRepository.findAll().stream()
                    .filter(m -> type.equals(m.getType()))
                    .map(this::toDto)
                    .toList();
        }

        List<ContentDto> fetchedDtos;
        if (ContentType.ANIME.equals(type)) {
            fetchedDtos = jikanClient.fetchAnimeList();
        } else {
            fetchedDtos = tmdbClient.fetchContentList(type);
        }

        // Filter out duplicates
        Set<String> existingExternalIds = contentRepository.findAll().stream()
                .filter(m -> type.equals(m.getType()))
                .map(Content::getExternalId)
                .collect(Collectors.toSet());

        List<Content> newContent = fetchedDtos.stream()
                .filter(dto -> !existingExternalIds.contains(dto.getExternalId()))
                .map(this::fromDto)
                .collect(Collectors.toList());

        List<Content> contentToSave = contentRepository.saveAll(newContent);
        fetchLogRepository.save(new FetchLog(fetchKey, now));

        return contentToSave.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }


    /**
     * Fetches enhanced content details (trailer, images, recommendations) for a specific content
     * @param externalId The external ID of the content
     * @param type The content type
     * @return ContentDetailsDto with enhanced information
     */
    /**
     * Fetches comprehensive content details including basic info and enhanced details (trailer, images, recommendations)
     * @param externalId The external ID of the content
     * @param type The content type
     * @return ContentDetailsDto with all content information
     */
    public ContentDetailsDto getContentDetails(String externalId, ContentType type) {
        LocalDateTime now = LocalDateTime.now();
        String fetchKey = "DETAILS_" + type.name() + "_" + externalId;

        // Check if we recently fetched this content's details
        Optional<FetchLog> fetchLog = fetchLogRepository.findById(fetchKey);
        boolean isRecentFetch = fetchLog
                .map(log -> log.getLastFetchedAt().isAfter(now.minus(ttl)))
                .orElse(false);

        // If TTL is valid, return cached data from database
        if (isRecentFetch) {
            Optional<Content> contentOpt = contentRepository.findAll().stream()
                    .filter(c -> externalId.equals(c.getExternalId()) && type.equals(c.getType()))
                    .findFirst();

            if (contentOpt.isPresent()) {
                Content content = contentOpt.get();
                ContentDetailsDto details = new ContentDetailsDto();
                
                // Set basic content information
                details.setId(content.getId());
                details.setTitle(content.getTitle());
                details.setDescription(content.getDescription());
                details.setGenreNames(content.getGenres() != null ? 
                    content.getGenres().stream().map(Genre::getName).toList() : new ArrayList<>());
                details.setPosterUrl(content.getPosterUrl());
                details.setRelease_date(content.getReleaseDate());
                details.setTrailerUrl(content.getTrailerUrl());
                details.setCastList(content.getCastList());
                details.setRatings(content.getRatings());
                details.setType(content.getType());
                details.setLabel(content.getLabel());
                details.setExternalId(content.getExternalId());
                details.setImageUrls(content.getImageUrls());
                details.setRecommendedContentIds(content.getRecommendedContentIds());
                details.setTrailerId(content.getTrailerId());

                // Get recommended content from database
                if (content.getRecommendedContentIds() != null && !content.getRecommendedContentIds().isEmpty()) {
                    List<ContentDto> recommended = contentRepository.findAll().stream()
                            .filter(c -> content.getRecommendedContentIds().contains(c.getExternalId()))
                            .map(this::toDto)
                            .toList();
                    details.setRecommendedContent(recommended);
                }

                return details;
            }
        }

        // Fetch fresh data from external APIs
        ContentDetailsDto details = new ContentDetailsDto();

        // First, get or fetch the basic content information
        Optional<Content> existingContentOpt = contentRepository.findAll().stream()
                .filter(c -> externalId.equals(c.getExternalId()) && type.equals(c.getType()))
                .findFirst();

        Content content;
        if (existingContentOpt.isPresent()) {
            content = existingContentOpt.get();
        } else {
            // Fetch basic content information
            ContentDto basicContentDto = null;
            if (ContentType.ANIME.equals(type)) {
                basicContentDto = jikanClient.fetchAnimeDetails(externalId);
            } else {
                basicContentDto = tmdbClient.fetchMovieDetails(externalId);
            }
            
            if (basicContentDto != null) {
                content = fromDto(basicContentDto);
                content = contentRepository.save(content);
            } else {
                return null; // Content not found
            }
        }

        // Set basic content information in the response
        details.setId(content.getId());
        details.setTitle(content.getTitle());
        details.setDescription(content.getDescription());
        details.setGenreNames(content.getGenres() != null ? 
        content.getGenres().stream().map(Genre::getName).toList() : new ArrayList<>());
        details.setPosterUrl(content.getPosterUrl());
        details.setRelease_date(content.getReleaseDate());
        details.setTrailerUrl(content.getTrailerUrl());
        details.setCastList(content.getCastList());
        details.setRatings(content.getRatings());
        details.setType(content.getType());
        details.setLabel(content.getLabel());
        details.setExternalId(content.getExternalId());
        details.setImageUrls(content.getImageUrls());
        details.setRecommendedContentIds(content.getRecommendedContentIds());
        details.setTrailerId(content.getTrailerId());

        // Fetch enhanced details
        if (ContentType.ANIME.equals(type)) {
            // Fetch anime details from Jikan
            details.setImageUrls(jikanClient.fetchImages(externalId));
            List<ContentDto> x = jikanClient.fetchRecommendations(externalId);
            details.setRecommendedContent(x);
            System.out.println("List: " + x.toString());

            // For anime, trailer URL is already available in the main content response
            if (content.getTrailerUrl() != null) {
                details.setTrailerUrl(content.getTrailerUrl());
            }
        } else {
            // Fetch movie/series details from TMDB
            TmdbClient.TrailerInfo trailerInfo = tmdbClient.fetchTrailer(externalId, type);
            if (trailerInfo != null) {
                details.setTrailerUrl(trailerInfo.getUrl());
                details.setTrailerId(trailerInfo.getId());
            }

            details.setImageUrls(tmdbClient.fetchImages(externalId, type));
            details.setRecommendedContent(tmdbClient.fetchRecommendations(externalId, type));
        }

        // Filter out duplicates and save new recommended content
        Set<String> existingExternalIds = contentRepository.findAll().stream()
                .filter(m -> type.equals(m.getType()))
                .map(Content::getExternalId)
                .collect(Collectors.toSet());

        List<Content> newContent = details.getRecommendedContent().stream()
                .filter(dto -> !existingExternalIds.contains(dto.getExternalId()))
                .map(this::fromDto)
                .toList();

        contentRepository.saveAll(newContent);

        // Update the content in database with new details
        content.setTrailerUrl(details.getTrailerUrl());
        content.setTrailerId(details.getTrailerId());
        content.setImageUrls(details.getImageUrls());

        // Store recommended content IDs
        if (details.getRecommendedContent() != null) {
            List<String> recommendedIds = details.getRecommendedContent().stream()
                    .map(ContentDto::getExternalId)
                    .collect(Collectors.toCollection(ArrayList::new));
            content.setRecommendedContentIds(recommendedIds);

            // Get Recommended Content from Database
            List<ContentDto> recommendedContent = contentRepository.findAll().stream()
                    .filter(c -> recommendedIds.contains(c.getExternalId()))
                    .map(this::toDto)
                    .collect(Collectors.toCollection(ArrayList::new));
            details.setRecommendedContent(recommendedContent);
        }

        contentRepository.save(content);

        // Log the fetch
        fetchLogRepository.save(new FetchLog(fetchKey, now));

        return details;
    }

    public List<ContentDto> searchContent(ContentType type, String query) {
//        List<Content> existingContent = contentRepository.findAll().stream()
//                .filter(m -> m.getTitle() != null && m.getTitle().toLowerCase().contains(query.toLowerCase()))
//                .filter(m -> m.getType() == type)
//                .toList();
//
//        if (!existingContent.isEmpty()) {
//            List<ContentDto> items = existingContent.stream()
//                    .map(this::toDto)
//                    .collect(Collectors.toList());
//            return items;
//        }

        List<ContentDto> searchResults = new ArrayList<>();

        if (type == ContentType.ANIME) {
            List<ContentDto> jikanResults = jikanClient.searchAnime(query);
            if (jikanResults != null) {
                searchResults.addAll(jikanResults);
            }
        } else {
            List<ContentDto> tmdbResults = tmdbClient.searchContent(query);
            if (tmdbResults != null) {
                searchResults.addAll(tmdbResults);
            }
        }

        if (!searchResults.isEmpty()) {
            // Filter out duplicates
            Set<String> existingExternalIds = contentRepository.findAll().stream()
                    .map(Content::getExternalId)
                    .collect(Collectors.toSet());

            List<Content> contentToSave = searchResults.stream()
                    .filter(dto -> !existingExternalIds.contains(dto.getExternalId()))
                    .map(this::fromDto)
                    .collect(Collectors.toList());

            contentRepository.saveAll(contentToSave);

            Set<String> searchExternalIds = searchResults.stream()
                    .map(ContentDto::getExternalId)
                    .collect(Collectors.toSet());

            return contentRepository.findAll().stream()
                    .filter(content -> content.getType() == type && searchExternalIds.contains(content.getExternalId()))
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }

        return Collections.emptyList();
    }

    public List<ContentDto> getTrendingContent(ContentType type) {
        LocalDateTime now = LocalDateTime.now();
        String fetchKey = "TRENDING_" + type.name();

        Optional<FetchLog> fetchLog = fetchLogRepository.findById(fetchKey);
        boolean isRecentFetch = fetchLog
                .map(log -> log.getLastFetchedAt().isAfter(now.minus(ttl)))
                .orElse(false);

//        if (isRecentFetch) {
//            return contentRepository.findAll().stream()
//                    .filter(m -> type.equals(m.getType()) && m.getLabel().equals(ContentLabel.TRENDING))
//                    .map(this::toDto)
//                    .toList();
//        }

        List<ContentDto> fetchedDtos;
        if (type == ContentType.ANIME) {
            fetchedDtos = jikanClient.fetchAnimeList();
        } else {
            fetchedDtos = tmdbClient.fetchTrendingContent(type);
        }

        Map<String, Content> existingByExternalId = contentRepository.findAll().stream()
                .filter(m -> type.equals(m.getType()))
                .collect(Collectors.toMap(
                        Content::getExternalId,
                        Function.identity(),
                        (existing, replacement) -> existing // or replacement
                ));

        List<Content> updatedContent = new ArrayList<>();

        for (ContentDto dto : fetchedDtos) {
            Content existing = existingByExternalId.get(dto.getExternalId());
            if (existing != null) {
                updateFromDto(existing, dto);
                updatedContent.add(existing);
            } else {
                Content newContent = fromDto(dto);
                updatedContent.add(newContent);
            }
        }

        contentRepository.saveAll(updatedContent);

        fetchLogRepository.save(new FetchLog(fetchKey, now));

        return contentRepository.findAll().stream()
                .filter(m -> type.equals(m.getType()) && ContentLabel.TRENDING.equals(m.getLabel()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ContentDto toDto(Content content) {
        List<String> genreNames = new ArrayList<>();
        if (content.getGenres() != null) {
            genreNames = content.getGenres().stream()
                    .map(Genre::getName)
                    .toList();
        }

        ContentDto dto = new ContentDto();
        dto.setId(content.getId());
        dto.setTitle(content.getTitle());
        dto.setDescription(content.getDescription());
        dto.setGenreNames(genreNames);
        dto.setPosterUrl(content.getPosterUrl());
        dto.setBackdropPath(content.getBackdropPath());
        dto.setRelease_date(content.getReleaseDate());
        dto.setTrailerUrl(content.getTrailerUrl());
        dto.setCastList(content.getCastList());
        dto.setRatings(content.getRatings());
        dto.setType(content.getType());
        dto.setLabel(content.getLabel());
        dto.setExternalId(content.getExternalId());
        dto.setImageUrls(content.getImageUrls());
        dto.setRecommendedContentIds(content.getRecommendedContentIds());
        dto.setTrailerId(content.getTrailerId());
        return dto;
    }

    public Content fromDto(ContentDto dto) {
        Set<Genre> genres = new HashSet<>();
        if (dto.getGenreIds() != null) {
            genres = dto.getGenreIds().stream()
                    .map(genreId -> genreRepository.findByExternalIdAndContentType(genreId, dto.getType())
                            .orElseThrow(() -> new RuntimeException("Genre not found: " + genreId)))
                    .collect(Collectors.toSet());
        }

        return Content.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .genres(genres)
                .posterUrl(dto.getPosterUrl())
                .backdropPath(dto.getBackdropPath())
                .trailerUrl(dto.getTrailerUrl())
                .releaseDate(dto.getRelease_date())
                .castList(dto.getCastList())
                .ratings(dto.getRatings())
                .type(dto.getType())
                .label(dto.getLabel())
                .externalId(dto.getExternalId())
                .imageUrls(dto.getImageUrls())
                .recommendedContentIds(dto.getRecommendedContentIds())
                .trailerId(dto.getTrailerId())
                .build();
    }

    public void updateFromDto(Content content, ContentDto dto) {
        // Update scalar fields
        content.setTitle(dto.getTitle());
        content.setDescription(dto.getDescription());
        content.setPosterUrl(dto.getPosterUrl());
        content.setBackdropPath(dto.getBackdropPath());
        content.setTrailerUrl(dto.getTrailerUrl());
        content.setReleaseDate(dto.getRelease_date());
        content.setCastList(dto.getCastList());
        content.setRatings(dto.getRatings());
        content.setType(dto.getType());
        content.setLabel(dto.getLabel());
        content.setImageUrls(dto.getImageUrls());
        content.setRecommendedContentIds(dto.getRecommendedContentIds());
        content.setTrailerId(dto.getTrailerId());
    }

}