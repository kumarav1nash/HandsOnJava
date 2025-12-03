package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "page_sections")
public class PageSectionEntity {
    public enum SectionType { CONCEPT, MCQ, CODE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "page_id", nullable = false)
    private CoursePageEntity page;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private SectionType type;

    @Column(name = "position", nullable = false)
    private int position;

    public PageSectionEntity() {}

    public PageSectionEntity(CoursePageEntity page, SectionType type, int position) {
        this.page = page;
        this.type = type;
        this.position = position;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CoursePageEntity getPage() { return page; }
    public void setPage(CoursePageEntity page) { this.page = page; }
    public SectionType getType() { return type; }
    public void setType(SectionType type) { this.type = type; }
    public int getPosition() { return position; }
    public void setPosition(int position) { this.position = position; }
}

