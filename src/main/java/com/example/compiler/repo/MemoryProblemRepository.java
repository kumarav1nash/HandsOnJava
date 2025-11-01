package com.example.compiler.repo;

import com.example.compiler.model.Problem;
import com.example.compiler.model.TestCase;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Adapter around existing InMemoryProblemRepo to satisfy the ProblemRepository interface
 * for backward compatibility.
 */
public class MemoryProblemRepository implements ProblemRepository {
    @Override
    public List<Problem> findAll() {
        return com.example.compiler.repo.InMemoryProblemRepo.list();
    }

    @Override
    public Optional<Problem> findById(String id) {
        return Optional.ofNullable(com.example.compiler.repo.InMemoryProblemRepo.get(id));
    }

    @Override
    public List<TestCase> findTestCasesByProblemId(String problemId) {
        Problem p = com.example.compiler.repo.InMemoryProblemRepo.get(problemId);
        return p == null ? new ArrayList<>() : p.getSamples();
    }

    @Override
    public void saveProblem(Problem problem) {
        throw new UnsupportedOperationException("Memory repository is read-only for problems");
    }

    @Override
    public void deleteProblem(String id) {
        throw new UnsupportedOperationException("Memory repository is read-only for problems");
    }

    @Override
    public void saveTestCase(String problemId, TestCase testCase) {
        throw new UnsupportedOperationException("Memory repository is read-only for test cases");
    }

    @Override
    public void deleteTestCasesByProblemId(String problemId) {
        throw new UnsupportedOperationException("Memory repository is read-only for test cases");
    }
}