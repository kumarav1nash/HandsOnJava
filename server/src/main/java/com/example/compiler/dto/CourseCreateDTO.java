package com.example.compiler.dto;

import com.example.compiler.jpa.entity.CourseEntity;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import java.util.List;

public class CourseCreateDTO {
    
    @NotBlank(message = "Course ID is required")
    @Size(max = 128, message = "Course ID must not exceed 128 characters")
    private String id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;
    
    @Size(max = 1000, message = "Summary must not exceed 1000 characters")
    private String summary;
    
    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;
    
    @Size(max = 500, message = "Thumbnail URL must not exceed 500 characters")
    private String thumbnailUrl;
    
    @Size(max = 32, message = "Level must not exceed 32 characters")
    private String level;
    
    @NotNull(message = "Difficulty level is required")
    private CourseEntity.DifficultyLevel difficultyLevel;
    
    private Integer durationMinutes;
    
    @Size(max = 10, message = "Maximum 10 tags allowed")
    private List<@Size(max = 50, message = "Tag must not exceed 50 characters") String> tags;
    
    @Size(max = 10, message = "Maximum 10 prerequisites allowed")
    private List<@Size(max = 128, message = "Prerequisite course ID must not exceed 128 characters") String> prerequisites;

    // Constructors
    public CourseCreateDTO() {}

    public CourseCreateDTO(String id, String title, String summary) {
        this.id = id;
        this.title = title;
        this.summary = summary;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public CourseEntity.DifficultyLevel getDifficultyLevel() {
        return difficultyLevel;
    }

    public void setDifficultyLevel(CourseEntity.DifficultyLevel difficultyLevel) {
        this.difficultyLevel = difficultyLevel;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
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
}