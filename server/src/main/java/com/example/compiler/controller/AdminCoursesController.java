package com.example.compiler.controller;

import com.example.compiler.jpa.entity.CourseEntity;
import com.example.compiler.jpa.entity.CoursePageEntity;
import com.example.compiler.jpa.repo.CourseEntityRepository;
import com.example.compiler.jpa.repo.CoursePageEntityRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api/admin/courses", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminCoursesController {
    private final CourseEntityRepository courses;
    private final CoursePageEntityRepository pages;

    public AdminCoursesController(CourseEntityRepository courses, CoursePageEntityRepository pages) {
        this.courses = courses;
        this.pages = pages;
    }

    @GetMapping
    public List<CourseEntity> list() { return courses.findAll(); }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void create(@RequestBody CourseEntity course) {
        validate(course);
        courses.save(course);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void update(@PathVariable String id, @RequestBody CourseEntity course) {
        validate(course);
        if (!id.equals(course.getId())) throw new IllegalArgumentException("Path id and body id must match");
        courses.save(course);
    }

    @DeleteMapping(path = "/{id}")
    public void delete(@PathVariable String id) {
        courses.deleteById(id);
    }

    @PostMapping(path = "/{courseId}/pages", consumes = MediaType.APPLICATION_JSON_VALUE)
    public CoursePageEntity addPage(@PathVariable String courseId, @RequestBody CoursePageEntity page) {
        CourseEntity course = courses.findById(courseId).orElseThrow(() -> new IllegalArgumentException("Course not found"));
        page.setCourse(course);
        return pages.save(page);
    }

    private void validate(CourseEntity c) {
        if (c.getId() == null || c.getId().isEmpty()) throw new IllegalArgumentException("Course id is required");
        if (c.getTitle() == null || c.getTitle().isEmpty()) throw new IllegalArgumentException("Title is required");
    }
}

