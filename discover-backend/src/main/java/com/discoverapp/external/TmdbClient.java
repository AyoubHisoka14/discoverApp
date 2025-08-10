package com.discoverapp.external;

import com.discoverapp.dto.ContentDto;
import com.discoverapp.dto.GenreDto;
import com.discoverapp.types.ContentLabel;
import com.discoverapp.types.ContentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TmdbClient {
    @Value("${api.tmdb.key}")
    private String apiKey;
    
    @Value("${api.tmdb.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    
    // URL templates using base URL
    private String getMovieUrl() { return baseUrl + "/movie/%s?api_key=%s&append_to_response=videos,credits"; }
    private String getDiscoverUrl() { return baseUrl + "/discover/%s?api_key=%s&sort_by=popularity.desc"; }
    private String getTrendingUrl() { return baseUrl + "/trending/%s/week?api_key=%s&sort_by=popularity.desc"; }
    private String getSearchUrl() { return baseUrl + "/search/multi?api_key=%s&query=%s"; }
    private String getGenresUrl() { return baseUrl + "/genre/%s/list?api_key=%s&language=en"; }
    private String getMovieVideosUrl() { return baseUrl + "/movie/%s/videos?api_key=%s"; }
    private String getSeriesVideosUrl() { return baseUrl + "/tv/%s/videos?api_key=%s"; }
    private String getMovieImagesUrl() { return baseUrl + "/movie/%s/images?api_key=%s"; }
    private String getSeriesImagesUrl() { return baseUrl + "/tv/%s/images?api_key=%s"; }
    private String getMovieRecommendationsUrl() { return baseUrl + "/movie/%s/recommendations?api_key=%s"; }
    private String getSeriesRecommendationsUrl() { return baseUrl + "/tv/%s/recommendations?api_key=%s"; }

    /**
     * Fetches movie details from TMDB by externalId. Maps the response to MovieDto.
     * @param externalId The TMDB movie ID
     * @return MovieDto or null if not found
     */
    public ContentDto fetchMovieDetails(String externalId) {
        try {
            String url = String.format(getMovieUrl(), externalId, apiKey);
            var response = restTemplate.getForObject(url, TmdbMovieResponse.class);
            if (response == null) return null;
            ContentDto dto = new ContentDto();
            dto.setTitle(response.title);
            dto.setDescription(response.overview);
            dto.setGenreIds(response.genres);
            dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + response.poster_path);
            dto.setBackdropPath("https://image.tmdb.org/t/p/original" + response.backdrop_path);
            dto.setTrailerUrl(response.getTrailerUrl());
            dto.setCastList(response.getCastString());
            dto.setRatings(response.vote_average);
            dto.setType(ContentType.ANIME);
            dto.setExternalId(externalId);
            return dto;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Fetches a list of content from TMDB based on the content type.
     * @param type The type of content to fetch (MOVIE or SERIES)
     * @return List of ContentDto or empty list if not found
     */
    public List<ContentDto> fetchContentList(ContentType type) {
        try {
            String mediaType = type == ContentType.SERIES ? "tv" : "movie";
            String url = String.format(getDiscoverUrl(), mediaType, apiKey);

            if (type == ContentType.SERIES) {
                DiscoverSeriesResponse response = restTemplate.getForObject(url, DiscoverSeriesResponse.class);
                if (response == null || response.results == null) return new ArrayList<>();

                return Arrays.stream(response.results)
                        .filter(result -> result.name != null && result.poster_path != null
                                && result.overview != null)
                        .map(result -> {
                            ContentDto dto = new ContentDto();
                            dto.setTitle(result.name);
                            dto.setDescription(result.overview);
                            dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                            dto.setBackdropPath("https://image.tmdb.org/t/p/original" + result.backdrop_path);
                            dto.setGenreIds(result.genre_ids);
                            dto.setRatings(result.vote_average);
                            dto.setRelease_date(result.first_air_date); // For series
                            dto.setType(type);
                            dto.setLabel(ContentLabel.CONTENT);
                            dto.setExternalId(String.valueOf(result.id));
                            return dto;
                        })
                        .collect(Collectors.toList());

            } else {
                DiscoverMoviesResponse response = restTemplate.getForObject(url, DiscoverMoviesResponse.class);
                if (response == null || response.results == null) return new ArrayList<>();

                return Arrays.stream(response.results)
                        .filter(result -> result.title != null && result.poster_path != null
                                && result.overview != null)
                        .map(result -> {
                            ContentDto dto = new ContentDto();
                            dto.setTitle(result.title);
                            dto.setDescription(result.overview);
                            dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                            dto.setBackdropPath("https://image.tmdb.org/t/p/original" + result.backdrop_path);
                            dto.setGenreIds(result.genre_ids);
                            dto.setRatings(result.vote_average);
                            dto.setRelease_date(result.release_date);
                            dto.setType(type);
                            dto.setLabel(ContentLabel.CONTENT);
                            dto.setExternalId(String.valueOf(result.id));
                            return dto;
                        })
                        .collect(Collectors.toList());
            }

        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public List<ContentDto> fetchTrendingContent(ContentType type) {
        try {
            String mediaType = type == ContentType.SERIES ? "tv" : "movie";
            String url = String.format(getTrendingUrl(), mediaType, apiKey);

            if (type == ContentType.SERIES) {
                DiscoverSeriesResponse response = restTemplate.getForObject(url, DiscoverSeriesResponse.class);
                if (response == null || response.results == null) return new ArrayList<>();

                return Arrays.stream(response.results)
                        .filter(result -> result.name != null && result.poster_path != null
                                && result.overview != null)
                        .map(result -> {
                            ContentDto dto = new ContentDto();
                            dto.setTitle(result.name);
                            dto.setDescription(result.overview);
                            dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                            dto.setBackdropPath("https://image.tmdb.org/t/p/original" + result.backdrop_path);
                            dto.setGenreIds(result.genre_ids);
                            dto.setRatings(result.vote_average);
                            dto.setRelease_date(result.first_air_date); // For series
                            dto.setType(type);
                            dto.setLabel(ContentLabel.TRENDING);
                            dto.setExternalId(String.valueOf(result.id));
                            return dto;
                        })
                        .collect(Collectors.toList());

            } else {
                DiscoverMoviesResponse response = restTemplate.getForObject(url, DiscoverMoviesResponse.class);
                if (response == null || response.results == null) return new ArrayList<>();

                return Arrays.stream(response.results)
                        .filter(result -> result.title != null && result.poster_path != null
                                && result.overview != null)
                        .map(result -> {
                            ContentDto dto = new ContentDto();
                            dto.setTitle(result.title);
                            dto.setDescription(result.overview);
                            dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                            dto.setBackdropPath("https://image.tmdb.org/t/p/original" + result.backdrop_path);
                            dto.setGenreIds(result.genre_ids);
                            dto.setRatings(result.vote_average);
                            dto.setRelease_date(result.release_date);
                            dto.setType(type);
                            dto.setLabel(ContentLabel.TRENDING);
                            dto.setExternalId(String.valueOf(result.id));
                            return dto;
                        })
                        .collect(Collectors.toList());
            }

        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Searches for content in TMDB.
     * @param query The search query
     * @return List of ContentDto or empty list if not found
     */
    public List<ContentDto> searchContent(String query) {
        try {
            String url = String.format(getSearchUrl(), apiKey, query);
            var response = restTemplate.getForObject(url, TmdbSearchResponse.class);
            
            if (response == null || response.results == null) return new ArrayList<>();
            
            return java.util.Arrays.stream(response.results)
                .filter(result -> "movie".equals(result.media_type) || "tv".equals(result.media_type)
                        && result.poster_path != null
                        && result.overview != null)
                .map(result -> {
                    ContentDto dto = new ContentDto();
                    dto.setTitle(result.title != null ? result.title : result.name);
                    dto.setDescription(result.overview);
                    dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                    dto.setGenreIds(result.genre_ids);
                    dto.setRatings(result.vote_average);
                    dto.setRelease_date(result.release_date != null ? result.release_date : result.first_air_date);
                    dto.setType("movie".equals(result.media_type) ? ContentType.MOVIE : ContentType.SERIES);
                    dto.setLabel(ContentLabel.CONTENT);
                    dto.setExternalId(String.valueOf(result.id));
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public List<GenreDto> fetchGenres(String contentType) {
        try {
            String url = String.format(getGenresUrl(), contentType, apiKey);
            TmdbGenresResponse response = restTemplate.getForObject(url, TmdbGenresResponse.class);

            if (response != null && response.genres != null) {
                return response.genres.stream()
                        .map(g -> {
                            GenreDto dto = new GenreDto();
                            dto.setExternalId(g.id);
                            dto.setName(g.name);
                            dto.setContentType(contentType.equals("movie") ? ContentType.MOVIE : ContentType.SERIES);
                            return dto;
                        })
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch genres: " + e.getMessage());
        }

        return new ArrayList<>(); // fallback in case of error or null response
    }

    /**
     * Fetches trailer information for a movie or series
     * @param externalId The TMDB movie/series ID
     * @param type The content type (MOVIE or SERIES)
     * @return Trailer URL and ID or null if not found
     */
    public TrailerInfo fetchTrailer(String externalId, ContentType type) {
        try {
            String url;
            if (type == ContentType.SERIES) {
                url = String.format(getSeriesVideosUrl(), externalId, apiKey);
            } else {
                url = String.format(getMovieVideosUrl(), externalId, apiKey);
            }
            
            var response = restTemplate.getForObject(url, TmdbVideosResponse.class);
            if (response == null || response.results == null) return null;
            
            // Find the first trailer
            var trailer = java.util.Arrays.stream(response.results)
                .filter(v -> "Trailer".equals(v.type) && "YouTube".equals(v.site))
                .findFirst()
                .orElse(null);
                
            if (trailer != null) {
                return new TrailerInfo("https://www.youtube.com/watch?v=" + trailer.key, trailer.key);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Fetches image gallery for a movie or series
     * @param externalId The TMDB movie/series ID
     * @param type The content type (MOVIE or SERIES)
     * @return List of image URLs or empty list if not found
     */
    public List<String> fetchImages(String externalId, ContentType type) {
        try {
            String url;
            if (type == ContentType.SERIES) {
                url = String.format(getSeriesImagesUrl(), externalId, apiKey);
            } else {
                url = String.format(getMovieImagesUrl(), externalId, apiKey);
            }
            
            var response = restTemplate.getForObject(url, TmdbImagesResponse.class);
            if (response == null || response.backdrops == null) return new ArrayList<>();
            
            return java.util.Arrays.stream(response.backdrops)
                .limit(10) // Limit to 10 images
                .map(img -> "https://image.tmdb.org/t/p/original" + img.file_path)
                .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Fetches recommended content for a movie or series
     * @param externalId The TMDB movie/series ID
     * @param type The content type (MOVIE or SERIES)
     * @return List of recommended ContentDto or empty list if not found
     */
    public List<ContentDto> fetchRecommendations(String externalId, ContentType type) {
        try {
            String url;
            if (type == ContentType.SERIES) {
                url = String.format(getSeriesRecommendationsUrl(), externalId, apiKey);
            } else {
                url = String.format(getMovieRecommendationsUrl(), externalId, apiKey);
            }
            
            var response = restTemplate.getForObject(url, TmdbRecommendationsResponse.class);
            if (response == null || response.results == null) return new ArrayList<>();
            
            return java.util.Arrays.stream(response.results)
                .limit(10) // Limit to 10 recommendations
                .map(result -> {
                    ContentDto dto = new ContentDto();
                    dto.setTitle(result.title != null ? result.title : result.name);
                    dto.setDescription(result.overview);
                    dto.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                    dto.setRatings(result.vote_average);
                    dto.setRelease_date(result.release_date != null ? result.release_date : result.first_air_date);
                    dto.setType(type);
                    dto.setLabel(ContentLabel.CONTENT);
                    dto.setExternalId(String.valueOf(result.id));
                    return dto;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    // Helper class for trailer information
    public static class TrailerInfo {
        private String url;
        private String id;
        
        public TrailerInfo(String url, String id) {
            this.url = url;
            this.id = id;
        }
        
        public String getUrl() { return url; }
        public String getId() { return id; }
    }

    private static class TmdbGenresResponse {
        public List<TmdbGenre> genres;

        public static class TmdbGenre {
            public Long id;
            public String name;
        }
    }

    // --- DTOs for TMDB response mapping ---
    private static class TmdbMovieResponse {
        public String title;
        public String overview;
        public String poster_path;
        public String backdrop_path;
        public double vote_average;
        public List<Long> genres;
        public Videos videos;
        public Credits credits;

//        public String getGenresAsString() {
//            if (genres == null) return "";
//            return String.join(", ", java.util.Arrays.stream(genres).map(g -> g.name).toList());
//        }
        public String getTrailerUrl() {
            if (videos == null || videos.results == null) return null;
            return java.util.Arrays.stream(videos.results)
                .filter(v -> "Trailer".equals(v.type) && "YouTube".equals(v.site))
                .findFirst()
                .map(v -> "https://www.youtube.com/watch?v=" + v.key)
                .orElse(null);
        }
        public String getCastString() {
            if (credits == null || credits.cast == null) return "";
            return String.join(", ", java.util.Arrays.stream(credits.cast).limit(5).map(c -> c.name).toList());
        }
        static class Genre { public String name; }
        static class Videos { public Video[] results; static class Video { public String key, site, type; } }
        static class Credits { public Cast[] cast; static class Cast { public String name; } }
    }

    // --- New DTOs for discover and search responses ---
    private static class DiscoverMoviesResponse {
        public Result[] results;
        static class Result {
            public int id;
            public String title;
            public List<Long> genre_ids;
            public LocalDate release_date;
            public String overview;
            public String poster_path;
            public String backdrop_path;
            public double vote_average;
        }
    }

    private static class DiscoverSeriesResponse {
        public Result[] results;
        static class Result {
            public int id;
            public String name;
            public List<Long> genre_ids;
            public LocalDate first_air_date;
            public String overview;
            public String poster_path;
            public String backdrop_path;
            public double vote_average;
        }
    }

    private static class TmdbSearchResponse {
        public Result[] results;
        static class Result {
            public int id;
            public String title;
            public String name;

            public LocalDate release_date;
            public LocalDate first_air_date;
            public List<Long> genre_ids;
            public String overview;
            public String poster_path;
            public double vote_average;
            public String media_type;
        }
    }

    // New response DTOs for enhanced content details
    private static class TmdbVideosResponse {
        public Video[] results;
        static class Video {
            public String key;
            public String site;
            public String type;
        }
    }

    private static class TmdbImagesResponse {
        public Image[] backdrops;
        static class Image {
            public String file_path;
        }
    }

    private static class TmdbRecommendationsResponse {
        public RecommendationResult[] results;
        static class RecommendationResult {
            public int id;
            public String title;
            public String name;
            public String overview;
            public String poster_path;
            public double vote_average;
            public LocalDate release_date;
            public LocalDate first_air_date;
        }
    }
} 