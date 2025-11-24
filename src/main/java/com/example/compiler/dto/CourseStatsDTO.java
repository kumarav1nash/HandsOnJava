package com.example.compiler.dto;

import java.time.LocalDateTime;

public class CourseStatsDTO {
    private String courseId;
    private long totalEnrollments;
    private long completedEnrollments;
    private double completionRate;
    private double averageRating;
    private int totalReviews;
    private long totalViews;
    private LocalDateTime lastUpdated;
    
    public CourseStatsDTO() {}
    
    public CourseStatsDTO(String courseId, long totalEnrollments, long completedEnrollments,
                         double completionRate, double averageRating, int totalReviews,
                         long totalViews, LocalDateTime lastUpdated) {
        this.courseId = courseId;
        this.totalEnrollments = totalEnrollments;
        this.completedEnrollments = completedEnrollments;
        this.completionRate = completionRate;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.totalViews = totalViews;
        this.lastUpdated = lastUpdated;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public long getTotalEnrollments() {
        return totalEnrollments;
    }

    public void setTotalEnrollments(long totalEnrollments) {
        this.totalEnrollments = totalEnrollments;
    }

    public long getCompletedEnrollments() {
        return completedEnrollments;
    }

    public void setCompletedEnrollments(long completedEnrollments) {
        this.completedEnrollments = completedEnrollments;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(double averageRating) {
        this.averageRating = averageRating;
    }

    public int getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(int totalReviews) {
        this.totalReviews = totalReviews;
    }

    public long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(long totalViews) {
        this.totalViews = totalViews;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}