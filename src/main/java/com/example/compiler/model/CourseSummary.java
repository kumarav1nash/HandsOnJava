package com.example.compiler.model;

public class CourseSummary {
    private String id;
    private String title;
    private String summary;
    private String level;

    public CourseSummary() {}

    public CourseSummary(String id, String title, String summary, String level) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.level = level;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
}

