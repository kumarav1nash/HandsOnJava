package com.example.compiler.model;

public class MCQOptionDTO {
    private long id;
    private String text;
    private boolean correct;

    public MCQOptionDTO() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}

