package com.discoverapp.service;

import com.discoverapp.dto.GenreDto;
import com.discoverapp.entity.Content;
import com.discoverapp.entity.FetchLog;
import com.discoverapp.external.JikanClient;
import com.discoverapp.external.TmdbClient;
import com.discoverapp.repository.FetchLogRepository;
import com.discoverapp.types.ContentType;
import com.discoverapp.entity.Genre;
import com.discoverapp.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GenreService {
    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private TmdbClient tmdbClient;

    @Autowired
    private JikanClient jikanClient;

    @Autowired
    public FetchLogRepository fetchLogRepository;

    Duration ttl = Duration.ofHours(12);

    public void fetchAndCacheGenres(ContentType contentType) {
        try {
            LocalDateTime now = LocalDateTime.now();
            String fetchKey = "GENRES";

            // Check if we recently fetched this type
            Optional<FetchLog> fetchLog = fetchLogRepository.findById(fetchKey);
            boolean isRecentFetch = fetchLog
                    .map(log -> log.getLastFetchedAt().isAfter(now.minus(ttl)))
                    .orElse(false);

            // If TTL is valid, return all existing content of that type
            if (isRecentFetch) {
                return;
            }

            List<GenreDto> genresDto;
            if (contentType.equals(ContentType.ANIME)) {
                genresDto = jikanClient.fetchGenres();
            }
            else if (contentType.equals(ContentType.MOVIE)){
                genresDto = tmdbClient.fetchGenres("movie");
            }
            else {
                genresDto = tmdbClient.fetchGenres("tv");
            }

            if (genresDto != null && !genresDto.isEmpty()) {

                List<Long> externalIds = genresDto.stream()
                        .map(GenreDto::getExternalId)
                        .toList();

                List<Genre> existing = genreRepository.findAllByExternalIdInAndContentType(externalIds, contentType);
                Set<Long> existingIds = existing.stream()
                        .map(Genre::getExternalId)
                        .collect(Collectors.toSet());

                List<Genre> toSave = genresDto.stream()
                        .filter(dto -> !existingIds.contains(dto.getExternalId()))
                        .map(this::fromDto)
                        .collect(Collectors.toList());

                if (!toSave.isEmpty()) {
                    genreRepository.saveAll(toSave);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch genres: " + e.getMessage());
        }
    }

    public List<Genre> mapGenreIdsToGenres(List<Long> genreIds) {
        return genreRepository.findAllById(genreIds);
    }

    public Genre fromDto(GenreDto dto) {
        return Genre.builder()
                .externalId(dto.getExternalId())
                .name(dto.getName())
                .contentType(dto.getContentType())
                .build();
    }
} 