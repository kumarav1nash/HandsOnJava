package com.example.compiler.service.llm;

import com.example.compiler.model.Problem;

public interface LLMService {
    class GenerationResult {
        public final String code;
        public final String notes;
        public GenerationResult(String code, String notes) {
            this.code = code;
            this.notes = notes;
        }
    }

    GenerationResult generateSolution(Problem problem, String prompt) throws Exception;

    class GeneratedCase {
        public final String input;
        public final String expectedOutput;
        public GeneratedCase(String input, String expectedOutput) {
            this.input = input;
            this.expectedOutput = expectedOutput;
        }
    }

    java.util.List<GeneratedCase> generateTestCases(Problem problem, String code, int count) throws Exception;
}