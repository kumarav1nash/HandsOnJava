package com.example.compiler.model;

public class SolutionSubmitRequest {
    private String problemId;
    private String code;

    public SolutionSubmitRequest() {}

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}