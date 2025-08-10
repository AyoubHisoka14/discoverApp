package com.discoverapp.external;

import com.discoverapp.types.ContentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GeminiClient {
    @Value("${api.gemini.key}")
    private String apiKey;
    
    @Value("${api.gemini.base-url}")
    private String baseUrl;
    
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls the Gemini API to get recommendations from a description.
     * @param description The user input
     * @param type The content type (MOVIE, SERIES, ANIME)
     * @return List of recommended titles
     */
    public List<String> getRecommendations(String description, ContentType type) {
        try {
            String geminiUrl = baseUrl + "/models/gemini-2.0-flash:generateContent?key=" + apiKey;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String prompt = "Suggest 8 really known " + type.name().toLowerCase() + " titles based on this description: " + description + ". Return only a comma-separated list of titles.";
            Map<String, Object> body = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<GeminiResponse> response = restTemplate.postForEntity(geminiUrl, entity, GeminiResponse.class);
            if (response.getBody() == null || response.getBody().candidates == null || response.getBody().candidates.length == 0)
                return List.of();
            String content = response.getBody().candidates[0].content.parts[0].text;
            // Split by comma and trim
            return List.of(content.split(", ?")).stream().map(String::trim).collect(Collectors.toList());
        } catch (Exception e) {
            return List.of("Mocked Gemini 1", "Mocked Gemini 2");
        }
    }

    // --- DTOs for Gemini response mapping ---
    private static class GeminiResponse {
        public Candidate[] candidates;
        static class Candidate {
            public Content content;
        }
        static class Content {
            public Part[] parts;
        }
        static class Part {
            public String text;
        }
    }
} 