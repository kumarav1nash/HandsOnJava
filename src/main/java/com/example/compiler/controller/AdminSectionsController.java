package com.example.compiler.controller;

import com.example.compiler.jpa.entity.*;
import com.example.compiler.jpa.repo.*;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/api/admin", produces = MediaType.APPLICATION_JSON_VALUE)
public class AdminSectionsController {
    private final PageSectionEntityRepository sections;
    private final CoursePageEntityRepository pages;
    private final ConceptSectionEntityRepository conceptSections;
    private final CodeSectionEntityRepository codeSections;
    private final MCQQuestionEntityRepository mcqQuestions;
    private final MCQOptionEntityRepository mcqOptions;

    public AdminSectionsController(PageSectionEntityRepository sections,
                                   CoursePageEntityRepository pages,
                                   ConceptSectionEntityRepository conceptSections,
                                   CodeSectionEntityRepository codeSections,
                                   MCQQuestionEntityRepository mcqQuestions,
                                   MCQOptionEntityRepository mcqOptions) {
        this.sections = sections;
        this.pages = pages;
        this.conceptSections = conceptSections;
        this.codeSections = codeSections;
        this.mcqQuestions = mcqQuestions;
        this.mcqOptions = mcqOptions;
    }

    @PostMapping(path = "/pages/{pageId}/sections", consumes = MediaType.APPLICATION_JSON_VALUE)
    public PageSectionEntity addSection(@PathVariable Long pageId, @RequestBody PageSectionEntity section) {
        CoursePageEntity page = pages.findById(pageId).orElseThrow(() -> new IllegalArgumentException("Page not found"));
        section.setPage(page);
        return sections.save(section);
    }

    @PutMapping(path = "/sections/{sectionId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateSection(@PathVariable Long sectionId, @RequestBody PageSectionEntity section) {
        if (!sectionId.equals(section.getId())) throw new IllegalArgumentException("Path id and body id must match");
        sections.save(section);
    }

    @DeleteMapping(path = "/sections/{sectionId}")
    public void deleteSection(@PathVariable Long sectionId) {
        sections.deleteById(sectionId);
    }

    // Concept content
    @PutMapping(path = "/sections/{sectionId}/concept", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void setConcept(@PathVariable Long sectionId, @RequestBody ConceptSectionEntity concept) {
        if (!sectionId.equals(concept.getSectionId())) throw new IllegalArgumentException("Path id and body id must match");
        conceptSections.save(concept);
    }

    // Code linkage
    @PutMapping(path = "/sections/{sectionId}/code", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void setCode(@PathVariable Long sectionId, @RequestBody CodeSectionEntity code) {
        if (!sectionId.equals(code.getSectionId())) throw new IllegalArgumentException("Path id and body id must match");
        codeSections.save(code);
    }

    // MCQ questions & options
    @PostMapping(path = "/sections/{sectionId}/mcq/questions", consumes = MediaType.APPLICATION_JSON_VALUE)
    public MCQQuestionEntity addQuestion(@PathVariable Long sectionId, @RequestBody MCQQuestionEntity q) {
        PageSectionEntity s = sections.findById(sectionId).orElseThrow(() -> new IllegalArgumentException("Section not found"));
        q.setSection(s);
        return mcqQuestions.save(q);
    }

    @PutMapping(path = "/mcq/questions/{questionId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateQuestion(@PathVariable Long questionId, @RequestBody MCQQuestionEntity q) {
        if (!questionId.equals(q.getId())) throw new IllegalArgumentException("Path id and body id must match");
        mcqQuestions.save(q);
    }

    @DeleteMapping(path = "/mcq/questions/{questionId}")
    public void deleteQuestion(@PathVariable Long questionId) {
        mcqQuestions.deleteById(questionId);
    }

    @PostMapping(path = "/mcq/questions/{questionId}/options", consumes = MediaType.APPLICATION_JSON_VALUE)
    public MCQOptionEntity addOption(@PathVariable Long questionId, @RequestBody MCQOptionEntity o) {
        MCQQuestionEntity q = mcqQuestions.findById(questionId).orElseThrow(() -> new IllegalArgumentException("Question not found"));
        o.setQuestion(q);
        return mcqOptions.save(o);
    }

    @PutMapping(path = "/mcq/options/{optionId}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public void updateOption(@PathVariable Long optionId, @RequestBody MCQOptionEntity o) {
        if (!optionId.equals(o.getId())) throw new IllegalArgumentException("Path id and body id must match");
        mcqOptions.save(o);
    }

    @DeleteMapping(path = "/mcq/options/{optionId}")
    public void deleteOption(@PathVariable Long optionId) {
        mcqOptions.deleteById(optionId);
    }
}

