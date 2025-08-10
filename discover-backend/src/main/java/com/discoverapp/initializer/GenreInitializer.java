package com.discoverapp.initializer;

import com.discoverapp.service.GenreService;
import com.discoverapp.types.ContentType;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class GenreInitializer {

    private final GenreService genreService;

    public GenreInitializer(GenreService genreService) {
        this.genreService = genreService;
    }

    @PostConstruct
    public void init() {
        genreService.fetchAndCacheGenres(ContentType.MOVIE);
        genreService.fetchAndCacheGenres(ContentType.SERIES);
        genreService.fetchAndCacheGenres(ContentType.ANIME);
    }
}

