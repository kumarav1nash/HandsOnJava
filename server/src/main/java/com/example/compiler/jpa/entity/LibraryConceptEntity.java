package com.example.compiler.jpa.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "library_concepts")
public class LibraryConceptEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String overview;

    @Column(columnDefinition = "TEXT")
    private String starterCode;

    @ElementCollection
    @CollectionTable(name = "library_concept_tags", joinColumns = @JoinColumn(name = "concept_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(length = 20)
    private String difficulty;

    // Store steps as JSON string for simplicity, or separate entity if needed.
    // Given the complexity, JSON string is often easier for "steps" if not queried deeply.
    // But let's check ConceptEditor. It sends `steps` array.
    // Let's make a simple element collection or JSON.
    // For now, let's assume JSON string or transient.
    // Actually, let's use a separate entity for steps to be clean.
    
    @ElementCollection
    @CollectionTable(name = "library_concept_steps", joinColumns = @JoinColumn(name = "concept_id"))
    private List<ConceptStepEmbeddable> steps = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
    public String getStarterCode() { return starterCode; }
    public void setStarterCode(String starterCode) { this.starterCode = starterCode; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public List<ConceptStepEmbeddable> getSteps() { return steps; }
    public void setSteps(List<ConceptStepEmbeddable> steps) { this.steps = steps; }
}
