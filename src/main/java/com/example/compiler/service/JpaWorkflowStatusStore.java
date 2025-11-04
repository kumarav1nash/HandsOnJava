package com.example.compiler.service;

import com.example.compiler.jpa.entity.ProblemEntity;
import com.example.compiler.jpa.repo.ProblemEntityRepository;
import com.example.compiler.model.ProblemStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public class JpaWorkflowStatusStore implements WorkflowStatusStore {
    private final ProblemEntityRepository problems;

    public JpaWorkflowStatusStore(ProblemEntityRepository problems) {
        this.problems = problems;
    }

    @Override
    public ProblemStatus getStatus(String problemId) {
        Optional<ProblemEntity> opt = problems.findById(problemId);
        return opt.map(ProblemEntity::getStatus).orElse(ProblemStatus.DRAFT);
    }

    @Override
    @Transactional
    public ProblemStatus setStatus(String problemId, ProblemStatus next) {
        ProblemEntity e = problems.findById(problemId)
                .orElseThrow(() -> new IllegalArgumentException("Problem not found: " + problemId));
        e.setStatus(next);
        problems.save(e);
        return next;
    }
}