package com.example.compiler.jpa.entity;

import javax.persistence.Embeddable;

@Embeddable
public class MCQOptionEmbeddable {
    private String id; // Frontend generated ID
    private String text;
    private boolean correct;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}
