package com.example.compiler.dto;

import java.util.List;

public class CoursePageDTO {
    private String pageId;
    private String courseId;
    private String title;
    private Integer orderIndex;
    private List<CourseSectionDTO> sections;

    public CoursePageDTO() {}

    public CoursePageDTO(String pageId, String courseId, String title, Integer orderIndex, List<CourseSectionDTO> sections) {
        this.pageId = pageId;
        this.courseId = courseId;
        this.title = title;
        this.orderIndex = orderIndex;
        this.sections = sections;
    }

    public String getPageId() {
        return pageId;
    }

    public void setPageId(String pageId) {
        this.pageId = pageId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public List<CourseSectionDTO> getSections() {
        return sections;
    }

    public void setSections(List<CourseSectionDTO> sections) {
        this.sections = sections;
    }
}