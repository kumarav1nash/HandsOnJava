package com.example.compiler.service;

import com.example.compiler.model.AuditRecord;
import com.example.compiler.model.ProblemStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory workflow service for Problems. Enforces allowed transitions and records audit events.
 */
@Service
public class WorkflowService {
    private final WorkflowStatusStore statusStore;
    private final Map<String, List<AuditRecord>> auditByProblem = new ConcurrentHashMap<>();

    public WorkflowService(WorkflowStatusStore statusStore) {
        this.statusStore = statusStore;
    }

    public ProblemStatus getStatus(String problemId) {
        return statusStore.getStatus(problemId);
    }

    public List<AuditRecord> getAudit(String problemId) {
        return Collections.unmodifiableList(auditByProblem.getOrDefault(problemId, new ArrayList<>()));
    }

    public ProblemStatus submitForReview(String problemId, String actor, String comment) {
        ProblemStatus current = getStatus(problemId);
        if (current != ProblemStatus.DRAFT && current != ProblemStatus.CHANGES_REQUESTED) {
            throw new IllegalStateException("Invalid transition: " + current + " -> IN_REVIEW");
        }
        return setStatus(problemId, actor, "submit_for_review", ProblemStatus.IN_REVIEW, comment);
    }

    public ProblemStatus requestChanges(String problemId, String actor, String comment) {
        ProblemStatus current = getStatus(problemId);
        if (current != ProblemStatus.IN_REVIEW) {
            throw new IllegalStateException("Invalid transition: " + current + " -> CHANGES_REQUESTED");
        }
        return setStatus(problemId, actor, "request_changes", ProblemStatus.CHANGES_REQUESTED, comment);
    }

    public ProblemStatus publish(String problemId, String actor, String comment) {
        ProblemStatus current = getStatus(problemId);
        if (current != ProblemStatus.IN_REVIEW) {
            throw new IllegalStateException("Invalid transition: " + current + " -> PUBLISHED");
        }
        return setStatus(problemId, actor, "publish", ProblemStatus.PUBLISHED, comment);
    }

    public ProblemStatus revertToDraft(String problemId, String actor, String comment) {
        ProblemStatus current = getStatus(problemId);
        if (current != ProblemStatus.PUBLISHED) {
            throw new IllegalStateException("Invalid transition: " + current + " -> DRAFT");
        }
        return setStatus(problemId, actor, "revert_to_draft", ProblemStatus.DRAFT, comment);
    }

    private ProblemStatus setStatus(String problemId, String actor, String action, ProblemStatus next, String comment) {
        statusStore.setStatus(problemId, next);
        auditByProblem.computeIfAbsent(problemId, k -> new ArrayList<>())
                .add(new AuditRecord(problemId, actor, action, System.currentTimeMillis(), comment));
        return next;
    }
}