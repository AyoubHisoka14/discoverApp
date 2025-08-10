package com.discoverapp.external;

import com.discoverapp.dto.ContentDto;
import com.discoverapp.dto.GenreDto;
import com.discoverapp.types.ContentLabel;
import com.discoverapp.types.ContentType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JikanClient {
    // Jikan API does not require an API key.
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String JIKAN_ANIME_URL = "https://api.jikan.moe/v4/anime/%s/full";
    private static final String JIKAN_TOP_ANIME_URL = "https://api.jikan.moe/v4/top/anime";
    private static final String JIKAN_TRENDING_ANIME_URL = "https://api.jikan.moe/v4/recommendations/anime";
    private static final String JIKAN_SEARCH_URL = "https://api.jikan.moe/v4/anime?q=%s";
    private static final String JIKAN_ANIME_BY_ID = "https://api.jikan.moe/v4/anime/%s";

    private static final String JIKAN_GENRES_URL = "https://api.jikan.moe/v4/genres/anime";
    
    // New URLs for enhanced content details
    private static final String JIKAN_ANIME_PICTURES_URL = "https://api.jikan.moe/v4/anime/%s/pictures";
    private static final String JIKAN_ANIME_RECOMMENDATIONS_URL = "https://api.jikan.moe/v4/anime/%s/recommendations";


    public List<GenreDto> fetchGenres() {
        try {
            JikanGenresResponse response = restTemplate.getForObject(JIKAN_GENRES_URL, JikanGenresResponse.class);

            if (response != null && response.data != null) {
                return Arrays.stream(response.data)
                        .map(g -> {
                            GenreDto dto = new GenreDto();
                            dto.setExternalId(g.mal_id);
                            dto.setName(g.name);
                            dto.setContentType(ContentType.ANIME);
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
     * Fetches anime details from Jikan by externalId. Maps the response to MovieDto.
     * @param externalId The Jikan anime ID
     * @return MovieDto or null if not found
     */
    public ContentDto fetchAnimeDetails(String externalId) {
        try {
            String url = String.format(JIKAN_ANIME_BY_ID, externalId);
            var response = restTemplate.getForObject(url, JikanAnimeByIDResponse.class);
            if (response == null || response.data == null) return null;
            var data = response.data;
            ContentDto dto = new ContentDto();
            dto.setTitle(data.title);
            dto.setDescription(data.synopsis);
            dto.setGenreIds(Arrays.stream(data.genres).map(it -> it.mal_id).toList());
            dto.setPosterUrl(data.images != null ? data.images.jpg.image_url : null);
            dto.setBackdropPath(data.images != null ? data.images.jpg.large_image_url : null);
            dto.setTrailerUrl(data.trailer != null ? data.trailer.url : null);
            dto.setCastList(""); // Jikan does not provide cast in this endpoint
            dto.setRatings(data.score);
            dto.setType(ContentType.ANIME);
            dto.setExternalId(externalId);
            return dto;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Fetches a list of top anime from Jikan.
     * @return List of ContentDto or empty list if not found
     */
    public List<ContentDto> fetchAnimeList() {
        try {
            var response = restTemplate.getForObject(JIKAN_TOP_ANIME_URL, JikanTopAnimeResponse.class);
            if (response == null || response.data == null) return new ArrayList<>();
            
            return Arrays.stream(response.data)
                .filter(anime -> anime.title != null && anime.images != null
                            && anime.images.jpg != null
                            && anime.images.jpg.image_url != null
                            && anime.synopsis != null)
                .map(anime -> {
                    ContentDto dto = new ContentDto();
                    dto.setTitle(anime.title);
                    dto.setDescription(anime.synopsis);
                    dto.setGenreIds(Arrays.stream(anime.genres).map(it -> it.mal_id).toList());
                    dto.setPosterUrl(anime.images != null ? anime.images.jpg.image_url : null);
                    dto.setBackdropPath(anime.images != null ? anime.images.jpg.large_image_url : null);
                    dto.setTrailerUrl(anime.trailer != null ? anime.trailer.url : null);
                    dto.setCastList(""); // Jikan does not provide cast in this endpoint
                    dto.setRatings(anime.score);
                    dto.setType(ContentType.ANIME);
                    dto.setLabel(ContentLabel.TRENDING);
                    dto.setExternalId(String.valueOf(anime.mal_id));
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    public List<ContentDto> fetchTrendingAnime() {
        try {
            var response = restTemplate.getForObject(JIKAN_TRENDING_ANIME_URL, JikanTopAnimeResponse.class);
            if (response == null || response.data == null) return new ArrayList<>();

            return java.util.Arrays.stream(response.data)
                    .map(anime -> {
                        ContentDto dto = new ContentDto();
                        dto.setTitle(anime.title);
                        dto.setDescription(anime.synopsis);
                        dto.setGenreIds(Arrays.stream(anime.genres).map(it -> it.mal_id).toList());
                        dto.setPosterUrl(anime.images != null ? anime.images.jpg.image_url : null);
                        dto.setBackdropPath(anime.images != null ? anime.images.jpg.large_image_url : null);
                        dto.setTrailerUrl(anime.trailer != null ? anime.trailer.url : null);
                        dto.setCastList(""); // Jikan does not provide cast in this endpoint
                        dto.setRatings(anime.score);
                        dto.setType(ContentType.ANIME);
                        dto.setLabel(ContentLabel.TRENDING);
                        dto.setExternalId(String.valueOf(anime.mal_id));
                        return dto;
                    })
                    .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Searches for anime in Jikan.
     * @param query The search query
     * @return List of ContentDto or empty list if not found
     */
    public List<ContentDto> searchAnime(String query) {
        try {
            String url = String.format(JIKAN_SEARCH_URL, query);
            var response = restTemplate.getForObject(url, JikanSearchResponse.class);
            if (response == null || response.data == null) return new ArrayList<>();
            
            return Arrays.stream(response.data)
                .filter(anime -> anime.title != null && anime.images != null
                        && anime.images.jpg != null
                        && anime.images.jpg.image_url != null
                        && anime.synopsis != null)
                .map(anime -> {
                    ContentDto dto = new ContentDto();
                    dto.setTitle(anime.title);
                    dto.setDescription(anime.synopsis);
                    dto.setGenreIds(Arrays.stream(anime.genres).map(it -> it.mal_id).toList());
                    dto.setPosterUrl(anime.images != null ? anime.images.jpg.image_url : null);
                    dto.setBackdropPath(anime.images != null ? anime.images.jpg.large_image_url : null);
                    dto.setTrailerUrl(anime.trailer != null ? anime.trailer.url : null);
                    dto.setCastList(""); // Jikan does not provide cast in this endpoint
                    dto.setRatings(anime.score);
                    dto.setType(ContentType.ANIME);
                    dto.setLabel(ContentLabel.CONTENT);
                    dto.setExternalId(String.valueOf(anime.mal_id));
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Fetches image gallery for an anime
     * @param externalId The Jikan anime ID
     * @return List of image URLs or empty list if not found
     */
    public List<String> fetchImages(String externalId) {
        try {
            String url = String.format(JIKAN_ANIME_PICTURES_URL, externalId);
            var response = restTemplate.getForObject(url, JikanPicturesResponse.class);
            if (response == null || response.data == null) return new ArrayList<>();
            
            return java.util.Arrays.stream(response.data)
                .limit(10) // Limit to 10 images
                .map(pic -> pic.jpg.large_image_url)
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    /**
     * Fetches recommended anime
     * @param externalId The Jikan anime ID
     * @return List of recommended ContentDto or empty list if not found
     */
    public List<ContentDto> fetchRecommendations(String externalId) {
        try {
            System.out.println("In 1");
            String url = String.format(JIKAN_ANIME_RECOMMENDATIONS_URL, externalId);
            var response = restTemplate.getForObject(url, JikanRecommendationsResponse.class);
            if (response == null || response.data == null) return new ArrayList<>();

            System.out.println("Count: " +Arrays.stream(response.data).count());
            return Arrays.stream(response.data)
                .limit(4)
                .map(item -> {
                    try {
                        Thread.sleep(700);
                    } catch (InterruptedException e) {
                        throw new RuntimeException(e);
                    }
                    String contentUrl = String.format(JIKAN_ANIME_BY_ID, item.entry.mal_id);
                    var contentResponse = restTemplate.getForObject(contentUrl, JikanAnimeByIDResponse.class);
                    if (contentResponse == null || contentResponse.data == null) {
                        System.out.println("Response is null or empty");
                        return null;
                    }

                    if (contentResponse.data.images.jpg != null
                        && contentResponse.data.title != null && !contentResponse.data.title.isEmpty()
                            && contentResponse.data.images.jpg.image_url != null
                            && contentResponse.data.synopsis != null && !contentResponse.data.synopsis.isEmpty()
                            && contentResponse.data.score > 0
                    ) {
                        return getContentDto(contentResponse);
                    }

                    return null;
                })
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private static ContentDto getContentDto(JikanAnimeByIDResponse contentResponse) {
        ContentDto dto = new ContentDto();
        dto.setTitle(contentResponse.data.title);
        dto.setDescription(contentResponse.data.synopsis);
        dto.setGenreIds(Arrays.stream(contentResponse.data.genres).map(it -> it.mal_id).toList());
        dto.setPosterUrl(contentResponse.data.images != null ? contentResponse.data.images.jpg.image_url : null);
        dto.setTrailerUrl(contentResponse.data.trailer != null ? contentResponse.data.trailer.url : null);
        dto.setCastList(""); // Jikan does not provide cast in this endpoint
        dto.setRatings(contentResponse.data.score);
        dto.setType(ContentType.ANIME);
        dto.setLabel(ContentLabel.CONTENT);
        dto.setExternalId(String.valueOf(contentResponse.data.mal_id));
        System.out.println("In 2");
        System.out.println("DTO: " + dto);
        return dto;
    }

    // Helper class for trailer information (Jikan already provides trailer URL in main response)
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

    private static class JikanGenresResponse {
        public JikanGenre[] data;

        public static class JikanGenre {
            public Long mal_id;
            public String name;
        }
    }

    // --- DTOs for Jikan response mapping ---
    private static class JikanAnimeResponse {
        public Anime data;
        static class Anime {
            public String title;
            public String synopsis;
            public double score;
            public Genre[] genres;
            public Images images;
            public Trailer trailer;
            public String getGenresAsString() {
                if (genres == null) return "";
                return String.join(", ", java.util.Arrays.stream(genres).map(g -> g.name).toList());
            }
            static class Genre { public String name; }
            static class Images { public Jpg jpg; static class Jpg { public String image_url; public String large_image_url; } }
            static class Trailer { public String url; }
        }
    }

    private static class JikanAnimeByIDResponse {
        public Anime data;
        static class Anime {
            public int mal_id;
            public String title;
            public String synopsis;
            public double score;
            public Genre[] genres;
            public Images images;
            public Trailer trailer;
            public String getGenresAsString() {
                if (genres == null) return "";
                return String.join(", ", java.util.Arrays.stream(genres).map(g -> g.name).toList());
            }
            static class Genre { public String name; public long mal_id;}
            static class Images { public Jpg jpg; static class Jpg { public String image_url; public String large_image_url; } }
            static class Trailer { public String url; }
        }
    }


    // --- New DTOs for top anime and search responses ---
    private static class JikanTopAnimeResponse {
        public Anime[] data;
        static class Anime {
            public int mal_id;
            public String title;
            public String synopsis;
            public double score;
            public Genre[] genres;
            public Images images;
            public Trailer trailer;
            public String getGenresAsString() {
                if (genres == null) return "";
                return String.join(", ", java.util.Arrays.stream(genres).map(g -> g.name).toList());
            }
            static class Genre { public String name; public long mal_id;}
            static class Images { public Jpg jpg; static class Jpg { public String image_url; public String large_image_url; } }
            static class Trailer { public String url; }
        }
    }

    private static class JikanSearchResponse {
        public Anime[] data;
        static class Anime {
            public int mal_id;
            public String title;
            public String synopsis;
            public double score;
            public Genre[] genres;
            public Images images;
            public Trailer trailer;
            public String getGenresAsString() {
                if (genres == null) return "";
                return String.join(", ", java.util.Arrays.stream(genres).map(g -> g.name).toList());
            }
            static class Genre { public String name; public long mal_id;}
            static class Images { public Jpg jpg; static class Jpg { public String image_url; public String large_image_url; } }
            static class Trailer { public String url; }
        }
    }

    // New response DTOs for enhanced content details
    private static class JikanPicturesResponse {
        public Picture[] data;
        static class Picture {
            public Jpg jpg;
            static class Jpg {
                public String image_url;
                public String small_image_url;
                public String large_image_url;
            }
        }
    }

    private static class JikanRecommendationsResponse {
        public Recommendation[] data;
        static class Recommendation {
            public AnimeEntry entry;
            static class AnimeEntry {
                public int mal_id;
                public String title;
                public String synopsis;
                public double score;
                public Images images;
                static class Images {
                    public Jpg jpg;
                    static class Jpg {
                        public String image_url;
                        public String large_image_url;
                    }
                }
            }
        }
    }
} 