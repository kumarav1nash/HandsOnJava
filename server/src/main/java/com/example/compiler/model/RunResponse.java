package com.example.compiler.model;

public class RunResponse {
    private String stdout;
    private String stderr;
    private int exitCode;
    private long durationMs;

    public RunResponse(String stdout, String stderr, int exitCode, long durationMs) {
        this.stdout = stdout;
        this.stderr = stderr;
        this.exitCode = exitCode;
        this.durationMs = durationMs;
    }

    public String getStdout() { return stdout; }
    public String getStderr() { return stderr; }
    public int getExitCode() { return exitCode; }
    public long getDurationMs() { return durationMs; }
}