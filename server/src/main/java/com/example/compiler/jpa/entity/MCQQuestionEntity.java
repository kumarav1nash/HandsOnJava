package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "mcq_questions")
public class MCQQuestionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private PageSectionEntity section;

    @Column(name = "prompt", nullable = false)
    private String prompt;

    @Column(name = "explanation")
    private String explanation;

    public MCQQuestionEntity() {}

    public MCQQuestionEntity(PageSectionEntity section, String prompt, String explanation) {
        this.section = section;
        this.prompt = prompt;
        this.explanation = explanation;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PageSectionEntity getSection() { return section; }
    public void setSection(PageSectionEntity section) { this.section = section; }
    public String getPrompt() { return prompt; }
    public void setPrompt(String prompt) { this.prompt = prompt; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}

