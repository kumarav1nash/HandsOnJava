package com.example.compiler.service;

import com.example.compiler.model.ProblemStatus;

/**
 * Abstraction for persisting and retrieving workflow status per problem.
 */
public interface WorkflowStatusStore {
    ProblemStatus getStatus(String problemId);
    ProblemStatus setStatus(String problemId, ProblemStatus next);
}