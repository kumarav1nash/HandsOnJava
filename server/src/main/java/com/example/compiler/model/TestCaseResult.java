package com.example.compiler.model;

public class TestCaseResult {
    private String input;
    private String expectedOutput;
    private String actualOutput;
    private String stderr;
    private int exitCode;
    private long durationMs;
    private boolean passed;
    private Long memoryUsage; // optional

    public TestCaseResult() {}

    public TestCaseResult(String input, String expectedOutput, String actualOutput, String stderr, int exitCode, long durationMs, boolean passed, Long memoryUsage) {
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.actualOutput = actualOutput;
        this.stderr = stderr;
        this.exitCode = exitCode;
        this.durationMs = durationMs;
        this.passed = passed;
        this.memoryUsage = memoryUsage;
    }

    public String getInput() { return input; }
    public String getExpectedOutput() { return expectedOutput; }
    public String getActualOutput() { return actualOutput; }
    public String getStderr() { return stderr; }
    public int getExitCode() { return exitCode; }
    public long getDurationMs() { return durationMs; }
    public boolean isPassed() { return passed; }
    public Long getMemoryUsage() { return memoryUsage; }
}