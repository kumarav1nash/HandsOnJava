package com.example.compiler.jpa.entity;

import javax.persistence.Embeddable;
import javax.persistence.Column;

@Embeddable
public class ConceptStepEmbeddable {
    private String description;
    private String stdin;
    private String expectedStdout;
    private String hint;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStdin() { return stdin; }
    public void setStdin(String stdin) { this.stdin = stdin; }
    public String getExpectedStdout() { return expectedStdout; }
    public void setExpectedStdout(String expectedStdout) { this.expectedStdout = expectedStdout; }
    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }
}
