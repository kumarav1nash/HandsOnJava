package com.example.compiler.jpa.entity;

import com.example.compiler.model.ProblemStatus;
import javax.persistence.*;

@Entity
@Table(name = "problems")
public class ProblemEntity {
    @Id
    @Column(name = "id", nullable = false, length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "statement", nullable = false, columnDefinition = "text")
    private String statement;

    @Column(name = "input_spec", nullable = false, columnDefinition = "text")
    private String inputSpec;

    @Column(name = "output_spec", nullable = false, columnDefinition = "text")
    private String outputSpec;

    @Column(name = "constraints", nullable = false, columnDefinition = "text")
    private String constraints;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProblemStatus status = ProblemStatus.DRAFT;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatement() { return statement; }
    public void setStatement(String statement) { this.statement = statement; }
    public String getInputSpec() { return inputSpec; }
    public void setInputSpec(String inputSpec) { this.inputSpec = inputSpec; }
    public String getOutputSpec() { return outputSpec; }
    public void setOutputSpec(String outputSpec) { this.outputSpec = outputSpec; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public ProblemStatus getStatus() { return status; }
    public void setStatus(ProblemStatus status) { this.status = status; }
}