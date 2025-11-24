package com.example.compiler.controller;

import com.example.compiler.dto.*;
import com.example.compiler.jpa.entity.*;
import com.example.compiler.jpa.repo.*;
import com.example.compiler.service.CourseManagementService;
import com.example.compiler.service.CourseVersioningService;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/courses")
public class AdminCourseManagementController {

    @Autowired
    private CourseManagementService courseManagementService;

    @Autowired
    private CourseVersioningService courseVersioningService;

    @Autowired
    private CourseEntityRepository courseRepository;

    // Course Management Endpoints

    @GetMapping
    public ResponseEntity<List<CourseDetailDTO>> getAllCourses() {
        List<CourseEntity> courseEntities = courseManagementService.getAllCourses();
        List<CourseDetailDTO> courses = courseEntities.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDetailDTO> getCourseById(@PathVariable String courseId) {
        CourseEntity course = courseManagementService.getCourseById(courseId);
        return ResponseEntity.ok(convertToDTO(course));
    }

    @PostMapping
    public ResponseEntity<CourseDetailDTO> createCourse(@Valid @RequestBody CourseCreateDTO courseDTO) {
        try {
            CourseEntity createdCourse = courseManagementService.createCourse(courseDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(createdCourse));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseDetailDTO> updateCourse(
            @PathVariable String courseId,
            @Valid @RequestBody CourseUpdateDTO courseDTO) {
        try {
            CourseEntity updatedCourse = courseManagementService.updateCourse(courseId, courseDTO);
            return ResponseEntity.ok(convertToDTO(updatedCourse));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable String courseId) {
        try {
            courseManagementService.deleteCourse(courseId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Course Workflow Management

    @PostMapping("/{courseId}/publish")
    public ResponseEntity<CourseDetailDTO> publishCourse(@PathVariable String courseId) {
        try {
            CourseEntity publishedCourse = courseManagementService.publishCourse(courseId);
            return ResponseEntity.ok(convertToDTO(publishedCourse));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{courseId}/unpublish")
    public ResponseEntity<CourseDetailDTO> unpublishCourse(@PathVariable String courseId) {
        try {
            CourseEntity unpublishedCourse = courseManagementService.unpublishCourse(courseId);
            return ResponseEntity.ok(convertToDTO(unpublishedCourse));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{courseId}/archive")
    public ResponseEntity<CourseDetailDTO> archiveCourse(@PathVariable String courseId) {
        try {
            CourseEntity archivedCourse = courseManagementService.archiveCourse(courseId);
            return ResponseEntity.ok(convertToDTO(archivedCourse));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Course Preview

    @GetMapping("/{courseId}/preview")
    public ResponseEntity<CourseDetailDTO> previewCourse(@PathVariable String courseId) {
        CourseEntity course = courseManagementService.previewCourse(courseId);
        return ResponseEntity.ok(convertToDTO(course));
    }

    // Course Versioning

    @GetMapping("/{courseId}/versions")
    public ResponseEntity<List<CourseVersionDTO>> getCourseVersions(@PathVariable String courseId) {
        List<CourseVersionDTO> versions = courseVersioningService.getCourseVersions(courseId);
        return ResponseEntity.ok(versions);
    }

    @PostMapping("/{courseId}/versions")
    public ResponseEntity<CourseVersionDTO> createCourseVersion(
            @PathVariable String courseId,
            @RequestParam String changeSummary) {
        try {
            CourseVersionDTO version = courseVersioningService.createCourseVersion(courseId, changeSummary);
            return ResponseEntity.status(HttpStatus.CREATED).body(version);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{courseId}/versions/{version}")
    public ResponseEntity<CourseVersionDTO> getCourseVersion(
            @PathVariable String courseId,
            @PathVariable int version) {
        CourseVersionDTO versionDTO = courseVersioningService.getCourseVersion(courseId, version);
        return ResponseEntity.ok(versionDTO);
    }

    @PostMapping("/{courseId}/versions/{version}/restore")
    public ResponseEntity<CourseDetailDTO> restoreCourseVersion(
            @PathVariable String courseId,
            @PathVariable int version) {
        try {
            CourseEntity restoredCourse = courseVersioningService.restoreCourseVersion(courseId, version);
            return ResponseEntity.ok(convertToDTO(restoredCourse));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Course Statistics

    @GetMapping("/{courseId}/stats")
    public ResponseEntity<CourseStatsDTO> getCourseStats(@PathVariable String courseId) {
        CourseStatsDTO stats = courseManagementService.getCourseStats(courseId);
        return ResponseEntity.ok(stats);
    }

    // Bulk Operations

    @PostMapping("/bulk/delete")
    public ResponseEntity<BulkOperationResultDTO> bulkDeleteCourses(@RequestBody List<String> courseIds) {
        try {
            BulkOperationResultDTO result = courseManagementService.bulkDeleteCourses(courseIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/bulk/publish")
    public ResponseEntity<BulkOperationResultDTO> bulkPublishCourses(@RequestBody List<String> courseIds) {
        try {
            BulkOperationResultDTO result = courseManagementService.bulkPublishCourses(courseIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Course Search and Filtering

    @GetMapping("/search")
    public ResponseEntity<List<CourseDetailDTO>> searchCourses(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String difficultyLevel,
            @RequestParam(required = false) List<String> tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<CourseEntity> courseEntities = courseManagementService.searchCourses(
                searchTerm, status, difficultyLevel, tags, page, size);
        List<CourseDetailDTO> courses = courseEntities.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(courses);
    }

    // Course Validation

    @PostMapping("/{courseId}/validate")
    public ResponseEntity<CourseValidationResultDTO> validateCourse(@PathVariable String courseId) {
        try {
            CourseValidationResultDTO validationResult = courseManagementService.validateCourse(courseId);
            return ResponseEntity.ok(validationResult);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    private CourseDetailDTO convertToDTO(CourseEntity course) {
        CourseDetailDTO dto = new CourseDetailDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        dto.setSummary(course.getSummary());
        dto.setDescription(course.getDescription());
        dto.setThumbnailUrl(course.getThumbnailUrl());
        dto.setDifficultyLevel(course.getDifficultyLevel());
        dto.setLevel(course.getDifficultyLevel().name());
        dto.setDurationMinutes(course.getDurationMinutes());
        dto.setStatus(course.getStatus());
        dto.setVersion(course.getVersion());
        dto.setPublishedAt(course.getPublishedAt());
        dto.setCreatedBy(course.getCreatedBy());
        dto.setTags(course.getTags());
        dto.setPrerequisites(course.getPrerequisites());
        dto.setCreatedAt(course.getCreatedAt());
        dto.setUpdatedAt(course.getUpdatedAt());
        return dto;
    }
}