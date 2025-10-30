package com.example.compiler.model;

public class SolutionRunRequest {
    private String problemId;
    private String code;
    private String language; // currently only 'java' supported

    public SolutionRunRequest() {}

    public String getProblemId() { return problemId; }
    public void setProblemId(String problemId) { this.problemId = problemId; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}