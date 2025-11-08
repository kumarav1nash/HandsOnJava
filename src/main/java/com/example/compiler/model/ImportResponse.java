package com.example.compiler.model;

public class ImportResponse {
    private String mode; // "dry_run" or "imported"
    private int problems;
    private int testcases;
    private String message;

    public ImportResponse() {}

    public ImportResponse(String mode, int problems, int testcases, String message) {
        this.mode = mode;
        this.problems = problems;
        this.testcases = testcases;
        this.message = message;
    }

    public String getMode() { return mode; }
    public int getProblems() { return problems; }
    public int getTestcases() { return testcases; }
    public String getMessage() { return message; }
}