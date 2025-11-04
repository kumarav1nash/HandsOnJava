package com.example.compiler.model;

import java.util.List;

/**
 * Transfer object for import/export of a problem with its test cases.
 * Samples are visible tests; hidden are non-sample tests used for submission judging.
 */
public class ProblemPack {
    private String id;
    private String title;
    private String statement;
    private String inputSpec;
    private String outputSpec;
    private String constraints;
    private List<TestCase> samples;
    private List<TestCase> hidden;

    public ProblemPack() {}

    public ProblemPack(String id, String title, String statement, String inputSpec, String outputSpec, String constraints,
                        List<TestCase> samples, List<TestCase> hidden) {
        this.id = id;
        this.title = title;
        this.statement = statement;
        this.inputSpec = inputSpec;
        this.outputSpec = outputSpec;
        this.constraints = constraints;
        this.samples = samples;
        this.hidden = hidden;
    }

    public String getId() { return id; }
    public String getTitle() { return title; }
    public String getStatement() { return statement; }
    public String getInputSpec() { return inputSpec; }
    public String getOutputSpec() { return outputSpec; }
    public String getConstraints() { return constraints; }
    public List<TestCase> getSamples() { return samples; }
    public List<TestCase> getHidden() { return hidden; }
}