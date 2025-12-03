package com.example.compiler.service;

import com.example.compiler.jpa.entity.*;
import com.example.compiler.jpa.repo.*;
import com.example.compiler.model.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseContentService {
    private final CourseEntityRepository courses;
    private final CoursePageEntityRepository pages;
    private final PageSectionEntityRepository sections;
    private final ConceptSectionEntityRepository conceptSections;
    private final CodeSectionEntityRepository codeSections;
    private final MCQQuestionEntityRepository mcqQuestions;
    private final MCQOptionEntityRepository mcqOptions;

    public CourseContentService(
            CourseEntityRepository courses,
            CoursePageEntityRepository pages,
            PageSectionEntityRepository sections,
            ConceptSectionEntityRepository conceptSections,
            CodeSectionEntityRepository codeSections,
            MCQQuestionEntityRepository mcqQuestions,
            MCQOptionEntityRepository mcqOptions
    ) {
        this.courses = courses;
        this.pages = pages;
        this.sections = sections;
        this.conceptSections = conceptSections;
        this.codeSections = codeSections;
        this.mcqQuestions = mcqQuestions;
        this.mcqOptions = mcqOptions;
    }

    public List<CourseSummary> listCourses() {
        return courses.findAll().stream()
                .map(c -> new CourseSummary(c.getId(), c.getTitle(), c.getSummary(), c.getLevel()))
                .collect(Collectors.toList());
    }

    public CourseDetail getCourseDetail(String id) {
        CourseEntity c = courses.findById(id).orElse(null);
        if (c == null) return null;
        List<CoursePageDTO> pageDtos = pages.findByCourseOrderByPositionAsc(c).stream()
                .map(this::toPageDto)
                .collect(Collectors.toList());
        return new CourseDetail(c.getId(), c.getTitle(), c.getSummary(), c.getLevel(), pageDtos);
    }

    private CoursePageDTO toPageDto(CoursePageEntity p) {
        List<SectionDTO> sectionDtos = sections.findByPageOrderByPositionAsc(p).stream()
                .map(this::toSectionDto)
                .collect(Collectors.toList());
        return new CoursePageDTO(p.getId(), p.getTitle(), p.getPosition(), sectionDtos);
    }

    private SectionDTO toSectionDto(PageSectionEntity s) {
        SectionDTO dto = new SectionDTO();
        dto.setId(s.getId());
        dto.setPosition(s.getPosition());
        switch (s.getType()) {
            case CONCEPT:
                dto.setType(SectionDTO.Type.CONCEPT);
                ConceptSectionEntity cs = conceptSections.findById(s.getId()).orElse(null);
                dto.setContent(cs != null ? cs.getContent() : "");
                break;
            case CODE:
                dto.setType(SectionDTO.Type.CODE);
                CodeSectionEntity code = codeSections.findById(s.getId()).orElse(null);
                dto.setProblemId(code != null ? code.getProblemId() : null);
                break;
            case MCQ:
                dto.setType(SectionDTO.Type.MCQ);
                List<MCQQuestionDTO> qs = mcqQuestions.findBySection(s).stream()
                        .map(q -> {
                            MCQQuestionDTO qdto = new MCQQuestionDTO();
                            qdto.setId(q.getId());
                            qdto.setPrompt(q.getPrompt());
                            qdto.setExplanation(q.getExplanation());
                            qdto.setOptions(mcqOptions.findByQuestion(q).stream().map(o -> {
                                MCQOptionDTO odto = new MCQOptionDTO();
                                odto.setId(o.getId());
                                odto.setText(o.getText());
                                odto.setCorrect(o.isCorrect());
                                return odto;
                            }).collect(Collectors.toList()));
                            return qdto;
                        }).collect(Collectors.toList());
                dto.setQuestions(qs);
                break;
        }
        return dto;
    }
}

