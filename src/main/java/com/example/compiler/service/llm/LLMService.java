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
}