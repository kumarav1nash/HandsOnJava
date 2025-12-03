package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "code_sections")
public class CodeSectionEntity {
    @Id
    @Column(name = "section_id")
    private Long sectionId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private PageSectionEntity section;

    @Column(name = "problem_id", nullable = false, length = 128)
    private String problemId;

    public CodeSectionEntity() {}

    public CodeSectionEntity(PageSectionEntity section, String problemId) {
        this.section = section;
        this.sectionId = section.getId();
        this.problemId = problemId;
    }

    public Long getSectionId() { return sectionId; }
    public PageSectionEntity getSection() { return section; }
    public void setSection(PageSectionEntity section) { this.section = section; this.sectionId = section.getId(); }
    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
}

