package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "course_pages")
public class CoursePageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private CourseEntity course;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "position", nullable = false)
    private int position;

    @Column(name = "path")
    private String path;

    public CoursePageEntity() {}

    public CoursePageEntity(CourseEntity course, String title, int position) {
        this.course = course;
        this.title = title;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CourseEntity getCourse() { return course; }
    public void setCourse(CourseEntity course) { this.course = course; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}

