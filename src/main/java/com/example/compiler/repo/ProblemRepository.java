package com.example.compiler.repo;

import com.example.compiler.model.Problem;
import com.example.compiler.model.TestCase;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository {
    List<Problem> findAll();
    Optional<Problem> findById(String id);
    List<TestCase> findTestCasesByProblemId(String problemId);

    // CRUD operations for admin or future features
    void saveProblem(Problem problem);
    void deleteProblem(String id);
    void saveTestCase(String problemId, TestCase testCase);
    void deleteTestCasesByProblemId(String problemId);
}