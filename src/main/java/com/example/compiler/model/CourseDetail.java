package com.example.compiler.model;

import java.util.List;

public class CourseDetail {
    private String id;
    private String title;
    private String summary;
    private String level;
    private List<CoursePageDTO> pages;

    public CourseDetail() {}

    public CourseDetail(String id, String title, String summary, String level, List<CoursePageDTO> pages) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.level = level;
        this.pages = pages;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }
    public List<CoursePageDTO> getPages() { return pages; }
    public void setPages(List<CoursePageDTO> pages) { this.pages = pages; }
}

