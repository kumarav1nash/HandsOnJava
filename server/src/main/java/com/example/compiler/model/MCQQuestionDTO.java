package com.example.compiler.model;

import java.util.List;

public class MCQQuestionDTO {
    private long id;
    private String prompt;
    private String explanation;
    private List<MCQOptionDTO> options;

    public MCQQuestionDTO() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public List<MCQOptionDTO> getOptions() { return options; }
    public void setOptions(List<MCQOptionDTO> options) { this.options = options; }
}

