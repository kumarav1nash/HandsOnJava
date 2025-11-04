package com.example.compiler.model;

public class AdminTestCaseRequest {
    private String input;
    private String expectedOutput;
    private boolean sample = true;

    public AdminTestCaseRequest() {}

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
    public boolean isSample() { return sample; }
    public void setSample(boolean sample) { this.sample = sample; }
}