package com.example.compiler.model;

import java.util.List;

public class SolutionSubmitResponse {
    private String problemId;
    private boolean accepted;
    private List<TestCaseResult> results;
    private String message;

    public SolutionSubmitResponse(String problemId, boolean accepted, List<TestCaseResult> results, String message) {
        this.problemId = problemId;
        this.accepted = accepted;
        this.results = results;
        this.message = message;
    }

    public String getProblemId() { return problemId; }
    public boolean isAccepted() { return accepted; }
    public List<TestCaseResult> getResults() { return results; }
    public String getMessage() { return message; }
}