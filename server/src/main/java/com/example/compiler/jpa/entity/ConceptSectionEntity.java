package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "concept_sections")
public class ConceptSectionEntity {
    @Id
    @Column(name = "section_id")
    private Long sectionId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private PageSectionEntity section;

    @Column(name = "content", nullable = false)
    private String content;

    public ConceptSectionEntity() {}

    public ConceptSectionEntity(PageSectionEntity section, String content) {
        this.section = section;
        this.sectionId = section.getId();
        this.content = content;
    }

    public Long getSectionId() { return sectionId; }
    public PageSectionEntity getSection() { return section; }
    public void setSection(PageSectionEntity section) { this.section = section; this.sectionId = section.getId(); }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}

