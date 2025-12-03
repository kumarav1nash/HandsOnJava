package com.example.compiler.model;

public class TestCase {
    private String input;
    private String expectedOutput;
    // Indicates whether this test case is a sample (visible in problem statement)
    private boolean sample;

    public TestCase() {}

    public TestCase(String input, String expectedOutput) {
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.sample = false;
    }

    public TestCase(String input, String expectedOutput, boolean sample) {
        this.input = input;
        this.expectedOutput = expectedOutput;
        this.sample = sample;
    }

    public String getInput() { return input; }
    public String getExpectedOutput() { return expectedOutput; }
    public boolean isSample() { return sample; }
}