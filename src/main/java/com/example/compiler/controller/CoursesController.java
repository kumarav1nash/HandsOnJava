package com.example.compiler.controller;

import com.example.compiler.model.CourseDetail;
import com.example.compiler.model.CourseSummary;
import com.example.compiler.service.CourseContentService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CoursesController {
    private final CourseContentService service;

    public CoursesController(CourseContentService service) {
        this.service = service;
    }

    @GetMapping("/courses")
    public List<CourseSummary> list() {
        return service.listCourses();
    }

    @GetMapping("/courses/{id}")
    public CourseDetail get(@PathVariable String id) {
        return service.getCourseDetail(id);
    }
}

