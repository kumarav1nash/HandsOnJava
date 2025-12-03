package com.example.compiler.repo;

import com.example.compiler.model.Problem;
import com.example.compiler.model.TestCase;

import java.util.List;
import java.util.Optional;

public interface ProblemRepository {
    List<Problem> findAll();
    Optional<Problem> findById(String id);
    List<TestCase> findTestCasesByProblemId(String problemId);
    // Includes hidden/non-sample test cases
    List<TestCase> findAllTestCasesByProblemId(String problemId);

    // CRUD operations for admin or future features
    void saveProblem(Problem problem);
    void deleteProblem(String id);
    void saveTestCase(String problemId, TestCase testCase);
    // Save a testcase and specify whether it's a sample (visible) or hidden
    void saveTestCase(String problemId, TestCase testCase, boolean isSample);
    void deleteTestCasesByProblemId(String problemId);
}