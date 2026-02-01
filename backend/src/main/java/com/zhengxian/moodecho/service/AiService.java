package com.zhengxian.moodecho.service;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);
    private static final String BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    
    private static final String CANDIDATES_FIELD = "candidates";

    @Value("${google.ai.api-key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();

    @SuppressWarnings("null")
    public Map<String, Object> analyzeJournal(String journalText) {
        String finalUrl = BASE_URL + "?key=" + apiKey;

        String prompt = """
            Analyze this diary entry: "%s".
            Return ONLY a valid JSON object (no markdown) with these fields:
            - "mood_score": an integer from 1 (worst) to 10 (best).
            - "summary": a 1-sentence summary of the user's day.
            """.formatted(journalText);

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(Map.of("text", prompt)))
            )
        );

        try {
            String response = restClient.post()
                .uri(finalUrl)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response);
            
            if (!root.has(CANDIDATES_FIELD) || root.path(CANDIDATES_FIELD).isEmpty()) {
                throw new AiGenerationException("AI response has no candidates");
            }

            String aiText = root.path(CANDIDATES_FIELD).get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();
            
            aiText = aiText.replace("```json", "").replace("```", "").trim();
            
            return mapper.readValue(aiText, new TypeReference<Map<String, Object>>() {});

        } catch (JsonProcessingException | AiGenerationException e) {
            logger.error("Error calling AI service: {}", e.getMessage());
            return Map.of("mood_score", 5, "summary", "AI is taking a nap, but your entry is saved.");
        }
    }

    public static class AiGenerationException extends RuntimeException {
        public AiGenerationException(String message) {
            super(message);
        }
    }
}