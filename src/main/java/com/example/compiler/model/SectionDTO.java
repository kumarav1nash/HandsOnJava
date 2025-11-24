package com.example.compiler.model;

import java.util.List;

public class SectionDTO {
    public enum Type { CONCEPT, MCQ, CODE }

    private long id;
    private Type type;
    private int position;
    private String content; // for concept
    private String problemId; // for code
    private List<MCQQuestionDTO> questions; // for mcq

    public SectionDTO() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public Type getType() { return type; }
    public void setType(Type type) { this.type = type; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public List<MCQQuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<MCQQuestionDTO> questions) { this.questions = questions; }
}

