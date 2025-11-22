package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "mcq_options")
public class MCQOptionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private MCQQuestionEntity question;

    @Column(name = "text", nullable = false)
    private String text;

    @Column(name = "correct", nullable = false)
    private boolean correct;

    public MCQOptionEntity() {}

    public MCQOptionEntity(MCQQuestionEntity question, String text, boolean correct) {
        this.question = question;
        this.text = text;
        this.correct = correct;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public MCQQuestionEntity getQuestion() { return question; }
    public void setQuestion(MCQQuestionEntity question) { this.question = question; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public boolean isCorrect() { return correct; }
    public void setCorrect(boolean correct) { this.correct = correct; }
}

