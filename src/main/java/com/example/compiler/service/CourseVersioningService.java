package com.example.compiler.service;

import com.example.compiler.dto.CourseVersionDTO;
import com.example.compiler.jpa.entity.CourseEntity;
import com.example.compiler.jpa.repo.CourseEntityRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CourseVersioningService {
    
    @Autowired
    private CourseEntityRepository courseEntityRepository;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    public CourseVersionDTO createCourseVersion(String courseId, String changeSummary) {
        try {
            CourseEntity course = courseEntityRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
            
            // Create a snapshot of the current course state
            String snapshotData = objectMapper.writeValueAsString(course);
            
            // In a real implementation, you would save this to a course_versions table
            // For now, we'll create a DTO with the version information
            CourseVersionDTO version = new CourseVersionDTO();
            version.setVersionId(UUID.randomUUID().toString());
            version.setCourseId(courseId);
            version.setVersionNumber(getNextVersionNumber(courseId));
            version.setChangeSummary(changeSummary);
            version.setCreatedBy(course.getCreatedBy());
            version.setCreatedAt(LocalDateTime.now());
            version.setSnapshotData(snapshotData);
            
            return version;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create course version: " + e.getMessage(), e);
        }
    }
    
    public List<CourseVersionDTO> getCourseVersions(String courseId) {
        // In a real implementation, you would query the course_versions table
        // For now, return an empty list
        return new java.util.ArrayList<>();
    }
    
    public CourseVersionDTO getCourseVersion(String courseId, int version) {
        // In a real implementation, you would query the course_versions table
        // For now, return a mock version
        CourseVersionDTO versionDTO = new CourseVersionDTO();
        versionDTO.setVersionId("mock-version-id");
        versionDTO.setCourseId(courseId);
        versionDTO.setVersionNumber(version);
        versionDTO.setChangeSummary("Mock version for testing");
        versionDTO.setCreatedBy("admin");
        versionDTO.setCreatedAt(java.time.LocalDateTime.now());
        versionDTO.setSnapshotData("{}");
        return versionDTO;
    }
    
    public CourseEntity restoreCourseVersion(String courseId, int version) {
        // In a real implementation, you would restore from the course_versions table
        // For now, just return the current course
        return courseEntityRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
    }
    
    private Integer getNextVersionNumber(String courseId) {
        // In a real implementation, you would query the course_versions table
        // For now, we'll return a mock version number
        return 1;
    }
}