package com.example.compiler.model;

public class RunRequest {
    private String code;
    private String input;

    public RunRequest() {}

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }
}