package com.example.compiler.model;

import java.util.List;

public class CoursePageDTO {
    private long id;
    private String title;
    private int position;
    private List<SectionDTO> sections;

    public CoursePageDTO() {}

    public CoursePageDTO(long id, String title, int position, List<SectionDTO> sections) {
        this.id = id;
        this.title = title;
        this.position = position;
        this.sections = sections;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
    public List<SectionDTO> getSections() { return sections; }
    public void setSections(List<SectionDTO> sections) { this.sections = sections; }
}

