package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "courses")
public class CourseEntity {
    @Id
    @Column(name = "id", length = 128)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "summary")
    private String summary;

    @Column(name = "level", length = 32)
    private String level;

    @Column(name = "status", length = 32)
    private String status = "ACTIVE";

    public CourseEntity() {}

    public CourseEntity(String id, String title, String summary, String level) {
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

