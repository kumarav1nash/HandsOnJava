package com.example.compiler.jpa.entity;

import javax.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private ProblemEntity problem;

    @Column(name = "input", nullable = false, columnDefinition = "text")
    private String input;

    @Column(name = "expected_output", nullable = false, columnDefinition = "text")
    private String expectedOutput;

    @Column(name = "is_sample", nullable = false)
    private boolean isSample;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProblemEntity getProblem() { return problem; }
    public void setProblem(ProblemEntity problem) { this.problem = problem; }
    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public boolean isSample() { return isSample; }
    public void setSample(boolean sample) { isSample = sample; }
}