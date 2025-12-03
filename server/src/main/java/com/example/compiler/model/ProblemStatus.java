package com.example.compiler.model;

/**
 * Workflow status for Problems. Persisted in-memory for now; interfaces stable for future JPA.
 */
public enum ProblemStatus {
    DRAFT,
    IN_REVIEW,
    CHANGES_REQUESTED,
    PUBLISHED
}