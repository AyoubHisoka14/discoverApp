package com.discoverapp.external;

import com.discoverapp.types.ContentType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiClient {
    @Value("${api.openai.key}")
    private String apiKey;
    
    @Value("${api.openai.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Calls the OpenAI API to get recommendations from a description.
     * @param description The user input
     * @return List of recommended titles
     */
    public List<String> getRecommendations(String description, ContentType type) {
        try {
            String openaiUrl = baseUrl + "/chat/completions";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            String prompt = "Suggest 4 " + type.name().toLowerCase() + " titles based on: " + description + ". Return only a comma-separated list of titles.";
            Map<String, Object> body = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 100
            );
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<OpenAiResponse> response = restTemplate.postForEntity(openaiUrl, entity, OpenAiResponse.class);
            if (response.getBody() == null || response.getBody().choices == null || response.getBody().choices.length == 0)
                return List.of();
            String content = response.getBody().choices[0].message.content;
            // Split by comma and trim
            return List.of(content.split(", ?")).stream().map(String::trim).toList();
        } catch (Exception e) {
            return List.of("Mocked Recommendation 1", "Mocked Recommendation 2");
        }
    }

    // --- DTOs for OpenAI response mapping ---
    private static class OpenAiResponse {
        public Choice[] choices;
        static class Choice { public Message message; }
        static class Message { public String content; }
    }
} 