package com.example.compiler.service;

import com.example.compiler.dto.BulkOperationResultDTO;
import com.example.compiler.dto.CourseValidationResultDTO;
import com.example.compiler.dto.CourseCreateDTO;
import com.example.compiler.dto.CourseUpdateDTO;
import com.example.compiler.dto.CourseStatsDTO;
import com.example.compiler.jpa.entity.CourseEntity;
import com.example.compiler.jpa.repo.CourseEntityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseManagementService {
    
    @Autowired
    private CourseEntityRepository courseEntityRepository;
    
    @Transactional
    public BulkOperationResultDTO bulkDeleteCourses(List<String> courseIds) {
        try {
            List<CourseEntity> courses = courseEntityRepository.findAllById(courseIds);
            courseEntityRepository.deleteAll(courses);
            
            List<String> deletedIds = courses.stream()
                .map(CourseEntity::getId)
                .collect(Collectors.toList());
                
            return BulkOperationResultDTO.success(deletedIds);
        } catch (Exception e) {
            return BulkOperationResultDTO.failure("Failed to delete courses: " + e.getMessage());
        }
    }
    
    @Transactional
    public BulkOperationResultDTO bulkPublishCourses(List<String> courseIds) {
        try {
            List<CourseEntity> courses = courseEntityRepository.findAllById(courseIds);
            
            for (CourseEntity course : courses) {
                if (course.getStatus() == CourseEntity.Status.DRAFT || 
                    course.getStatus() == CourseEntity.Status.IN_REVIEW) {
                    course.setStatus(CourseEntity.Status.PUBLISHED);
                }
            }
            
            courseEntityRepository.saveAll(courses);
            
            List<String> publishedIds = courses.stream()
                .map(CourseEntity::getId)
                .collect(Collectors.toList());
                
            return BulkOperationResultDTO.success(publishedIds);
        } catch (Exception e) {
            return BulkOperationResultDTO.failure("Failed to publish courses: " + e.getMessage());
        }
    }
    
    public List<CourseEntity> getAllCourses() {
        return courseEntityRepository.findAll();
    }
    
    public List<CourseEntity> searchCourses(String searchTerm, String status, String difficultyLevel, 
                                          List<String> tags, int page, int size) {
        // For now, return all courses
        // In a real implementation, you would implement proper search logic
        return courseEntityRepository.findAll();
    }
    
    public CourseEntity getCourseById(String courseId) {
        return courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
    }
    
    public CourseEntity createCourse(CourseCreateDTO courseDTO) {
        CourseEntity course = new CourseEntity();
        course.setId(courseDTO.getId());
        course.setTitle(courseDTO.getTitle());
        course.setSummary(courseDTO.getSummary());
        course.setDescription(courseDTO.getDescription());
        course.setThumbnailUrl(courseDTO.getThumbnailUrl());
        course.setDurationMinutes(courseDTO.getDurationMinutes());
        course.setDifficultyLevel(courseDTO.getDifficultyLevel());
        course.setStatus(CourseEntity.Status.DRAFT); // Default to DRAFT for new courses
        course.setTags(courseDTO.getTags());
        course.setPrerequisites(courseDTO.getPrerequisites());
        course.setCreatedBy("admin"); // Should come from authentication
        
        return courseEntityRepository.save(course);
    }
    
    @Transactional
    public CourseEntity updateCourse(String courseId, CourseUpdateDTO courseDTO) {
        CourseEntity course = courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        
        course.setTitle(courseDTO.getTitle());
        course.setSummary(courseDTO.getSummary());
        course.setDescription(courseDTO.getDescription());
        course.setThumbnailUrl(courseDTO.getThumbnail());
        course.setDurationMinutes(courseDTO.getDurationMinutes());
        course.setDifficultyLevel(courseDTO.getDifficultyLevel());
        course.setStatus(courseDTO.getStatus());
        course.setTags(courseDTO.getTags());
        course.setPrerequisites(courseDTO.getPrerequisites());
        
        return courseEntityRepository.save(course);
    }
    
    public void deleteCourse(String courseId) {
        if (!courseEntityRepository.existsById(courseId)) {
            throw new RuntimeException("Course not found: " + courseId);
        }
        courseEntityRepository.deleteById(courseId);
    }
    
    @Transactional
    public CourseEntity publishCourse(String courseId) {
        CourseEntity course = courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        
        course.setStatus(CourseEntity.Status.PUBLISHED);
        return courseEntityRepository.save(course);
    }
    
    @Transactional
    public CourseEntity unpublishCourse(String courseId) {
        CourseEntity course = courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        
        course.setStatus(CourseEntity.Status.DRAFT);
        return courseEntityRepository.save(course);
    }
    
    @Transactional
    public CourseEntity archiveCourse(String courseId) {
        CourseEntity course = courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        
        course.setStatus(CourseEntity.Status.ARCHIVED);
        return courseEntityRepository.save(course);
    }
    
    public CourseEntity previewCourse(String courseId) {
        return courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
    }
    
    public CourseStatsDTO getCourseStats(String courseId) {
        // Mock implementation - in a real system, you would query analytics tables
        CourseStatsDTO stats = new CourseStatsDTO();
        stats.setCourseId(courseId);
        stats.setTotalEnrollments(100);
        stats.setCompletedEnrollments(75);
        stats.setCompletionRate(0.75);
        stats.setAverageRating(4.5);
        stats.setTotalReviews(25);
        stats.setTotalViews(500);
        stats.setLastUpdated(java.time.LocalDateTime.now());
        return stats;
    }
    
    public CourseValidationResultDTO validateCourse(String courseId) {
        try {
            CourseEntity course = courseEntityRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            
            // For now, we'll do basic validation without content sections
            // In a real implementation, you would query the content repository
            List<String> errors = new java.util.ArrayList<>();
            List<String> warnings = new java.util.ArrayList<>();
            
            if (course.getTitle() == null || course.getTitle().trim().isEmpty()) {
                errors.add("Course title is required");
            }
            
            if (course.getSummary() == null || course.getSummary().trim().isEmpty()) {
                warnings.add("Course summary is recommended");
            }
            
            boolean isValid = errors.isEmpty();
            
            if (isValid) {
                return CourseValidationResultDTO.valid(0, 0, 0, 0, 0);
            } else {
                return CourseValidationResultDTO.invalid(errors, warnings);
            }
            
        } catch (Exception e) {
            return CourseValidationResultDTO.invalid(
                Arrays.asList("Validation failed: " + e.getMessage()), 
                Arrays.asList()
            );
        }
    }
}