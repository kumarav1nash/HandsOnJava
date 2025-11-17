package com.example.compiler.service.llm;

import com.example.compiler.model.Problem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiLLMService implements LLMService {
    private final String apiKey;
    private final String model;
    private final String endpoint;
    private final String apiVersion;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiLLMService(
            @Value("${google.genai.apiKey:AIzaSyA15lixvigQm4GovML9ceKtcMguj-Uy9oU}") String apiKey,
            @Value("${google.genai.model:gemini-2.5-flash}") String model,
            @Value("${google.genai.endpoint:https://generativelanguage.googleapis.com}") String endpoint,
            @Value("${google.genai.apiVersion:v1}") String apiVersion
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = endpoint.endsWith("/") ? endpoint.substring(0, endpoint.length() - 1) : endpoint;
        this.apiVersion = apiVersion;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public GenerationResult generateSolution(Problem problem, String prompt) throws Exception {
        if (isBlank(apiKey)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "Google GenAI API key is not configured (google.genai.apiKey)"
            );
        }

        String userPrompt = buildPrompt(problem, prompt);
        String url = String.format("%s/%s/models/%s:generateContent?key=%s", endpoint, apiVersion, model, apiKey);

        String payload = "{\n" +
                "  \"contents\": [\n" +
                "    {\n" +
                "      \"role\": \"user\",\n" +
                "      \"parts\": [ { \"text\": " + jsonString(userPrompt) + " } ]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"generationConfig\": {\n" +
                "    \"temperature\": 0.2,\n" +
                "    \"topK\": 40,\n" +
                "    \"topP\": 0.95\n" +
                "  }\n" +
                "}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<String>(payload, headers);

        ResponseEntity<String> resp;
        try {
            resp = restTemplate.postForEntity(url, entity, String.class);
        } catch (org.springframework.web.client.RestClientResponseException e) {
            String body = e.getResponseBodyAsString();
            org.springframework.http.HttpStatus status;
            try {
                status = org.springframework.http.HttpStatus.valueOf(e.getRawStatusCode());
            } catch (IllegalArgumentException iae) {
                status = org.springframework.http.HttpStatus.BAD_GATEWAY;
            }
            throw new org.springframework.web.server.ResponseStatusException(status, "GenAI API error: " + (body == null ? e.getMessage() : body));
        } catch (org.springframework.web.client.ResourceAccessException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY, "GenAI network error: " + e.getMessage(), e);
        }
        
        if (!resp.getStatusCode().is2xxSuccessful()) {
            String body = resp.getBody();
            throw new org.springframework.web.server.ResponseStatusException(resp.getStatusCode(), "GenAI API error: " + (body == null ? "" : body));
        }

        String text = extractTextFromResponse(resp.getBody());
        String code = extractJavaFromText(text);
        String notes = "Model=" + model + "; prompt tokens unknown";
        return new GenerationResult(code == null ? text : code, notes);
    }

    @Override
    public java.util.List<GeneratedCase> generateTestCases(Problem problem, String code, int count) throws Exception {
        if (isBlank(apiKey)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                "Google GenAI API key is not configured (google.genai.apiKey)"
            );
        }

        int n = Math.max(1, Math.min(20, count));
        String userPrompt = buildTestCasePrompt(problem, code, n);
        String url = String.format("%s/%s/models/%s:generateContent?key=%s", endpoint, apiVersion, model, apiKey);

        String payload = "{\n" +
                "  \"contents\": [\n" +
                "    {\n" +
                "      \"role\": \"user\",\n" +
                "      \"parts\": [ { \"text\": " + jsonString(userPrompt) + " } ]\n" +
                "    }\n" +
                "  ],\n" +
                "  \"generationConfig\": {\n" +
                "    \"temperature\": 0.2,\n" +
                "    \"topK\": 40,\n" +
                "    \"topP\": 0.9\n" +
                "  }\n" +
                "}";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<String>(payload, headers);

        ResponseEntity<String> resp;
        try {
            resp = restTemplate.postForEntity(url, entity, String.class);
        } catch (org.springframework.web.client.RestClientResponseException e) {
            String body = e.getResponseBodyAsString();
            org.springframework.http.HttpStatus status;
            try { status = org.springframework.http.HttpStatus.valueOf(e.getRawStatusCode()); } catch (IllegalArgumentException iae) { status = org.springframework.http.HttpStatus.BAD_GATEWAY; }
            throw new org.springframework.web.server.ResponseStatusException(status, "GenAI API error: " + (body == null ? e.getMessage() : body));
        } catch (org.springframework.web.client.ResourceAccessException e) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY, "GenAI network error: " + e.getMessage(), e);
        }

        if (!resp.getStatusCode().is2xxSuccessful()) {
            String body = resp.getBody();
            throw new org.springframework.web.server.ResponseStatusException(resp.getStatusCode(), "GenAI API error: " + (body == null ? "" : body));
        }

        String text = extractTextFromResponse(resp.getBody());
        java.util.List<GeneratedCase> out = parseGeneratedCases(text);
        return out;
    }

    private String buildTestCasePrompt(Problem p, String code, int count) {
        StringBuilder sb = new StringBuilder();
        sb.append("You will create additional test cases for the given programming problem and its Java solution.\\n");
        sb.append("Return ONLY valid JSON (no code fences, no explanations).\\n");
        sb.append("The JSON MUST be an array of objects with fields: input, expectedOutput.\\n");
        sb.append("Ensure inputs match the problem's input format and expectedOutput matches exact output format.\\n");
        sb.append("Generate ").append(count).append(" diverse test cases including edge cases.\\n\\n");

        sb.append("Problem ID: ").append(p.getId()).append("\\n");
        sb.append("Title: ").append(p.getTitle()).append("\\n\\n");
        sb.append("Statement:\n").append(p.getStatement()).append("\\n\\n");
        sb.append("Input Spec:\n").append(p.getInputSpec()).append("\\n\\n");
        sb.append("Output Spec:\n").append(p.getOutputSpec()).append("\\n\\n");
        sb.append("Constraints:\n").append(p.getConstraints() == null ? "" : p.getConstraints()).append("\\n\\n");

        if (!isBlank(code)) {
            sb.append("Reference Java solution (use this to derive expected outputs):\\n");
            sb.append(code).append("\\n\\n");
        }

        sb.append("STRICT OUTPUT: JSON array like: ");
        sb.append("[{\"input\":\"<input>\",\"expectedOutput\":\"<output>\"}]\\n");
        return sb.toString();
    }

    private java.util.List<GeneratedCase> parseGeneratedCases(String text) {
        java.util.List<GeneratedCase> result = new java.util.ArrayList<>();
        if (isBlank(text)) return result;
        String json = text.trim();
        // If wrapped in code fences, try to extract JSON block
        java.util.regex.Pattern fenced = java.util.regex.Pattern.compile("```(?:json)?\\n(.*?)```", java.util.regex.Pattern.DOTALL);
        java.util.regex.Matcher fm = fenced.matcher(json);
        if (fm.find()) { json = fm.group(1).trim(); }
        try {
            JsonNode root = objectMapper.readTree(json);
            if (root.isArray()) {
                for (JsonNode n : root) {
                    String input = n.path("input").asText(null);
                    String expected = n.path("expectedOutput").asText(null);
                    if (!isBlank(input) && !isBlank(expected)) {
                        result.add(new GeneratedCase(input, expected));
                    }
                }
            } else {
                // Single object
                String input = root.path("input").asText(null);
                String expected = root.path("expectedOutput").asText(null);
                if (!isBlank(input) && !isBlank(expected)) {
                    result.add(new GeneratedCase(input, expected));
                }
            }
        } catch (Exception e) {
            // Fallback: try regex to find JSON-like objects
            java.util.regex.Pattern p = java.util.regex.Pattern.compile("\\{[^}]*\\}", java.util.regex.Pattern.DOTALL);
            java.util.regex.Matcher m = p.matcher(json);
            while (m.find()) {
                String obj = m.group();
                try {
                    JsonNode n = objectMapper.readTree(obj);
                    String input = n.path("input").asText(null);
                    String expected = n.path("expectedOutput").asText(null);
                    if (!isBlank(input) && !isBlank(expected)) {
                        result.add(new GeneratedCase(input, expected));
                    }
                } catch (Exception ignore) {}
            }
        }
        return result;
    }

    private String buildPrompt(Problem p, String adminPrompt) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert Java developer. Generate a complete, compilable Java solution for the following problem.\n");
        sb.append("- Keep code within a single class named Main with main() entry.\n");
        sb.append("- Read input exactly as described and print outputs exactly matching expected format.\n");
        sb.append("- Do not include explanations or comments, only code.\n\n");
        sb.append("Problem ID: ").append(p.getId()).append("\n");
        sb.append("Title: ").append(p.getTitle()).append("\n\n");
        sb.append("Statement:\n").append(p.getStatement()).append("\n\n");
        sb.append("Input Spec:\n").append(p.getInputSpec()).append("\n\n");
        sb.append("Output Spec:\n").append(p.getOutputSpec()).append("\n\n");
        sb.append("Constraints:\n").append(p.getConstraints() == null ? "" : p.getConstraints()).append("\n\n");
        if (!isBlank(adminPrompt)) {
            sb.append("Admin Prompt:\n").append(adminPrompt).append("\n\n");
        }
        sb.append("Return only Java code. If using Markdown, wrap in ```java fences.");
        return sb.toString();
    }

    private static String jsonString(String s) {
        String escaped = s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        return "\"" + escaped + "\"";
    }

    private String extractTextFromResponse(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    for (JsonNode part : parts) {
                        JsonNode textNode = part.get("text");
                        if (textNode != null && !textNode.isNull()) {
                            return textNode.asText();
                        }
                    }
                }
            }
        } catch (Exception ignore) {
        }
        Pattern p = Pattern.compile("\\\"text\\\"\\s*:\\s*\\\"(.*?)\\\"", Pattern.DOTALL);
        Matcher m = p.matcher(body);
        if (m.find()) {
            String txt = m.group(1);
            return txt.replace("\\n", "\n");
        }
        return body;
    }

    // Try to extract Java code between triple backticks
    private static String extractJavaFromText(String text) {
        if (text == null) return null;
        Pattern fenced = Pattern.compile("```java\\n(.*?)```", Pattern.DOTALL);
        Matcher fm = fenced.matcher(text);
        if (fm.find()) {
            return fm.group(1).trim();
        }
        // If generic fences present
        Pattern fencedAny = Pattern.compile("```\\n(.*?)```", Pattern.DOTALL);
        Matcher fa = fencedAny.matcher(text);
        if (fa.find()) {
            return fa.group(1).trim();
        }
        // If no fences, and looks like Java, return as-is
        if (text.contains("class ") && text.contains("public static void main")) {
            return text.trim();
        }
        return null;
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}