package com.example.compiler.dto;

import com.example.compiler.jpa.entity.CourseEntity;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.List;

public class CourseUpdateDTO {
    
    @NotBlank(message = "Course title is required")
    @Size(max = 255, message = "Course title must not exceed 255 characters")
    private String title;
    
    @Size(max = 1000, message = "Course summary must not exceed 1000 characters")
    private String summary;
    
    @Size(max = 500, message = "Course description must not exceed 500 characters")
    private String description;
    
    private String thumbnail;
    
    @NotNull(message = "Course duration is required")
    private Integer durationMinutes;
    
    @NotNull(message = "Difficulty level is required")
    private CourseEntity.DifficultyLevel difficultyLevel;
    
    @NotNull(message = "Course status is required")
    private CourseEntity.Status status;
    
    private List<String> tags;
    private List<String> prerequisites;
    private String learningObjectives;
    
    public CourseUpdateDTO() {}
    
    public CourseUpdateDTO(String title, String summary, String description, String thumbnail,
                          Integer durationMinutes, CourseEntity.DifficultyLevel difficultyLevel,
                          CourseEntity.Status status, List<String> tags, List<String> prerequisites,
                          String learningObjectives) {
        this.title = title;
        this.summary = summary;
        this.description = description;
        this.thumbnail = thumbnail;
        this.durationMinutes = durationMinutes;
        this.difficultyLevel = difficultyLevel;
        this.status = status;
        this.tags = tags;
        this.prerequisites = prerequisites;
        this.learningObjectives = learningObjectives;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public CourseEntity.DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(CourseEntity.DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public CourseEntity.Status getStatus() {
        return status;
    }

    public void setStatus(CourseEntity.Status status) {
        this.status = status;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<String> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<String> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public String getLearningObjectives() {
        return learningObjectives;
    }

    public void setLearningObjectives(String learningObjectives) {
        this.learningObjectives = learningObjectives;
    }
}