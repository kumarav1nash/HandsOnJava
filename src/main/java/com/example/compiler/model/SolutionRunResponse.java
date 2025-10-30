package com.example.compiler.model;

import java.util.List;

public class SolutionRunResponse {
    private String problemId;
    private boolean allPassed;
    private List<TestCaseResult> results;

    public SolutionRunResponse(String problemId, boolean allPassed, List<TestCaseResult> results) {
        this.problemId = problemId;
        this.allPassed = allPassed;
        this.results = results;
    }

    public String getProblemId() { return problemId; }
    public boolean isAllPassed() { return allPassed; }
    public List<TestCaseResult> getResults() { return results; }
}