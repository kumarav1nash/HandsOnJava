package com.example.compiler.dto;

public class CourseSectionDTO {
    
    public enum ContentType {
        CONCEPT, CODE, MCQ, PRACTICE
    }
    
    private String sectionId;
    private String pageId;
    private String title;
    private ContentType type;
    private String content;
    private Integer orderIndex;

    public CourseSectionDTO() {}

    public CourseSectionDTO(String sectionId, String pageId, String title, 
                           ContentType type, String content, Integer orderIndex) {
        this.sectionId = sectionId;
        this.pageId = pageId;
        this.title = title;
        this.type = type;
        this.content = content;
        this.orderIndex = orderIndex;
    }

    public String getSectionId() {
        return sectionId;
    }

    public void setSectionId(String sectionId) {
        this.sectionId = sectionId;
    }

    public String getPageId() {
        return pageId;
    }

    public void setPageId(String pageId) {
        this.pageId = pageId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public ContentType getType() {
        return type;
    }

    public void setType(ContentType type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}