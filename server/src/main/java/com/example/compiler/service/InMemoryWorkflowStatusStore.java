package com.example.compiler.service;

import com.example.compiler.model.ProblemStatus;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class InMemoryWorkflowStatusStore implements WorkflowStatusStore {
    private final Map<String, ProblemStatus> statusByProblem = new ConcurrentHashMap<>();

    @Override
    public ProblemStatus getStatus(String problemId) {
        return statusByProblem.getOrDefault(problemId, ProblemStatus.DRAFT);
    }

    @Override
    public ProblemStatus setStatus(String problemId, ProblemStatus next) {
        statusByProblem.put(problemId, next);
        return next;
    }
}