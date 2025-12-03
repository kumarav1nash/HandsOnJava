package com.example.compiler.model;

/**
 * Simple audit record for workflow actions. Stored in-memory for now.
 */
public class AuditRecord {
    private final String problemId;
    private final String actor;
    private final String action;
    private final long timestamp;
    private final String comment;

    public AuditRecord(String problemId, String actor, String action, long timestamp, String comment) {
        this.problemId = problemId;
        this.actor = actor;
        this.action = action;
        this.timestamp = timestamp;
        this.comment = comment;
    }

    public String getProblemId() { return problemId; }
    public String getActor() { return actor; }
    public String getAction() { return action; }
    public long getTimestamp() { return timestamp; }
    public String getComment() { return comment; }
}