package com.example.compiler.controller;

import com.example.compiler.jpa.entity.CoursePageEntity;
import com.example.compiler.jpa.repo.CoursePageEntityRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/admin/pages", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminCoursePagesController {
    private final CoursePageEntityRepository pages;

    public AdminCoursePagesController(CoursePageEntityRepository pages) {
        this.pages = pages;
    }

    @PutMapping(path = "/{pageId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void update(@PathVariable Long pageId, @RequestBody CoursePageEntity page) {
        if (!pageId.equals(page.getId())) throw new IllegalArgumentException("Path id and body id must match");
        pages.save(page);
    }

    @DeleteMapping(path = "/{pageId}")
    public void delete(@PathVariable Long pageId) {
        pages.deleteById(pageId);
    }
}

