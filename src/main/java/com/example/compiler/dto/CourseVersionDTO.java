package com.example.compiler.dto;

import java.time.LocalDateTime;

public class CourseVersionDTO {
    private String versionId;
    private String courseId;
    private Integer versionNumber;
    private String changeSummary;
    private String createdBy;
    private LocalDateTime createdAt;
    private String snapshotData;

    public CourseVersionDTO() {}

    public CourseVersionDTO(String versionId, String courseId, Integer versionNumber, 
                           String changeSummary, String createdBy, LocalDateTime createdAt, 
                           String snapshotData) {
        this.versionId = versionId;
        this.courseId = courseId;
        this.versionNumber = versionNumber;
        this.changeSummary = changeSummary;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.snapshotData = snapshotData;
    }

    public String getVersionId() {
        return versionId;
    }

    public void setVersionId(String versionId) {
        this.versionId = versionId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(Integer versionNumber) {
        this.versionNumber = versionNumber;
    }

    public String getChangeSummary() {
        return changeSummary;
    }

    public void setChangeSummary(String changeSummary) {
        this.changeSummary = changeSummary;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSnapshotData() {
        return snapshotData;
    }

    public void setSnapshotData(String snapshotData) {
        this.snapshotData = snapshotData;
    }
}