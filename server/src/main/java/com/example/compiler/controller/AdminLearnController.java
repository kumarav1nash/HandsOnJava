package com.example.compiler.controller;

import com.example.compiler.jpa.entity.*;
import com.example.compiler.jpa.repo.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/learn")
public class AdminLearnController {

    @Autowired private LibraryConceptRepository conceptRepo;
    @Autowired private LibraryMCQRepository mcqRepo;
    @Autowired private LibraryPracticeRepository practiceRepo;
    @Autowired private CourseEntityRepository courseRepo;
    @Autowired private CoursePageEntityRepository pageRepo;
    @Autowired private PageSectionEntityRepository sectionRepo;
    @Autowired private ConceptSectionEntityRepository conceptSectionRepo;
    @Autowired private MCQQuestionEntityRepository mcqQuestionRepo;
    @Autowired private CodeSectionEntityRepository codeSectionRepo;
    @Autowired private MCQOptionEntityRepository mcqOptionRepo;

    // --- Concepts ---
    @PostMapping("/concepts")
    public LibraryConceptEntity createConcept(@RequestBody LibraryConceptEntity concept) {
        return conceptRepo.save(concept);
    }

    @GetMapping("/concepts/{id}")
    public LibraryConceptEntity getConcept(@PathVariable Long id) {
        return conceptRepo.findById(id).orElseThrow(() -> new RuntimeException("Concept not found"));
    }

    // --- MCQs ---
    @PostMapping("/mcq")
    public LibraryMCQEntity createMcq(@RequestBody LibraryMCQEntity mcq) {
        return mcqRepo.save(mcq);
    }

    @GetMapping("/mcq/{id}")
    public LibraryMCQEntity getMcq(@PathVariable Long id) {
        return mcqRepo.findById(id).orElseThrow(() -> new RuntimeException("MCQ not found"));
    }

    // --- Practices ---
    @PostMapping("/practices")
    public LibraryPracticeEntity createPractice(@RequestBody LibraryPracticeEntity practice) {
        return practiceRepo.save(practice);
    }

    @GetMapping("/practices/{id}")
    public LibraryPracticeEntity getPractice(@PathVariable Long id) {
        return practiceRepo.findById(id).orElseThrow(() -> new RuntimeException("Practice not found"));
    }

    // --- Courses ---
    @GetMapping("/courses")
    public List<CourseEntity> listCourses() {
        return courseRepo.findAll();
    }

    @GetMapping("/courses/{id}")
    public CourseEntity getCourse(@PathVariable String id) {
        // We might need to reconstruct the "modules" view if we want to edit it as modules.
        // For now, return the entity. The frontend might need to handle the "Page" structure 
        // OR we map it back to modules.
        // Given the task is "Refactor Admin", and we are saving as Pages, 
        // the frontend "CourseBuilder" expects "modules".
        // If we return raw pages, the builder might break.
        // Ideally, we should store the "modules" list in the course entity or a separate table 
        // to preserve the "editor state".
        // But for this task, let's assume we return the course and the frontend adapts, 
        // OR we just support creation for now.
        return courseRepo.findById(id).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @PostMapping("/courses")
    @Transactional
    public CourseEntity createCourse(@RequestBody LearnCourseCreateDTO dto) {
        CourseEntity course = new CourseEntity();
        course.setId(UUID.randomUUID().toString());
        course.setTitle(dto.title);
        course.setSummary(dto.summary);
        course.setLevel(dto.level);
        course.setTags(dto.tags);
        course.setStatus(CourseEntity.Status.valueOf(dto.status));
        // Set defaults
        course.setDifficultyLevel(CourseEntity.DifficultyLevel.BEGINNER);

        course = courseRepo.save(course);

        if (dto.modules != null) {
            int pageOrder = 0;
            for (LearnModuleDTO module : dto.modules) {
                CoursePageEntity page = new CoursePageEntity();
                page.setCourse(course);
                page.setTitle(module.type.toUpperCase()); // Or fetch title from library
                page.setPosition(pageOrder++);
                page = pageRepo.save(page);

                PageSectionEntity section = new PageSectionEntity();
                section.setPage(page);
                section.setPosition(0);
                
                if ("concept".equals(module.type)) {
                    section.setType(PageSectionEntity.SectionType.CONCEPT);
                    section = sectionRepo.save(section);
                    
                    LibraryConceptEntity lib = conceptRepo.findById(module.refId)
                            .orElseThrow(() -> new RuntimeException("Concept library not found"));
                    ConceptSectionEntity content = new ConceptSectionEntity(section, lib.getOverview());
                    conceptSectionRepo.save(content);
                    
                    // Update page title
                    page.setTitle(lib.getTitle());
                    pageRepo.save(page);

                } else if ("mcq".equals(module.type)) {
                    section.setType(PageSectionEntity.SectionType.MCQ);
                    section = sectionRepo.save(section);
                    
                    LibraryMCQEntity lib = mcqRepo.findById(module.refId)
                            .orElseThrow(() -> new RuntimeException("MCQ library not found"));
                    
                    for (LibraryMCQQuestionEntity q : lib.getQuestions()) {
                        MCQQuestionEntity question = new MCQQuestionEntity(section, q.getPrompt(), q.getExplanation());
                        question = mcqQuestionRepo.save(question);
                        
                        for (MCQOptionEmbeddable opt : q.getOptions()) {
                            MCQOptionEntity option = new MCQOptionEntity(question, opt.getText(), opt.isCorrect());
                            mcqOptionRepo.save(option);
                        }
                    }
                    
                    page.setTitle(lib.getTitle());
                    pageRepo.save(page);

                } else if ("practice".equals(module.type)) {
                    section.setType(PageSectionEntity.SectionType.CODE);
                    section = sectionRepo.save(section);
                    
                    LibraryPracticeEntity lib = practiceRepo.findById(module.refId)
                            .orElseThrow(() -> new RuntimeException("Practice library not found"));
                    CodeSectionEntity content = new CodeSectionEntity(section, "practice-" + lib.getId()); 
                    // ProblemID is usually a string reference.
                    codeSectionRepo.save(content);
                    
                    page.setTitle(lib.getTitle());
                    pageRepo.save(page);
                }
            }
        }

        return course;
    }

    // DTOs
    public static class LearnCourseCreateDTO {
        public String title;
        public String summary;
        public String level;
        public List<String> tags;
        public String status;
        public List<LearnModuleDTO> modules;
    }

    public static class LearnModuleDTO {
        public String type;
        public Long refId;
    }
}
