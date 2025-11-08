package com.example.compiler.model;

import java.util.List;

public class Problem {
    private String id;
    private String title;
    private String statement;
    private String inputSpec;
    private String outputSpec;
    private List<TestCase> samples;
    private String constraints;
    // New: problem tags (e.g., dp, graph, string). Optional.
    private List<String> tags;

    public Problem() {}

    public Problem(String id, String title, String statement, String inputSpec, String outputSpec, List<TestCase> samples, String constraints) {
        this.id = id;
        this.title = title;
        this.statement = statement;
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
        this.samples = samples;
        this.constraints = constraints;
    }

    public Problem(String id, String title, String statement, String inputSpec, String outputSpec, List<TestCase> samples, String constraints, List<String> tags) {
        this(id, title, statement, inputSpec, outputSpec, samples, constraints);
        this.tags = tags;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getStatement() { return statement; }
    public String getInputSpec() { return inputSpec; }
    public String getOutputSpec() { return outputSpec; }
    public List<TestCase> getSamples() { return samples; }
    public String getConstraints() { return constraints; }
    public List<String> getTags() { return tags; }
}