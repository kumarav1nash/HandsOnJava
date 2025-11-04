package com.example.compiler.jpa;

import com.example.compiler.model.Problem;
import com.example.compiler.model.TestCase;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.jpa.entity.ProblemEntity;
import com.example.compiler.jpa.entity.TestCaseEntity;
import com.example.compiler.jpa.repo.ProblemEntityRepository;
import com.example.compiler.jpa.repo.TestCaseEntityRepository;
import com.example.compiler.util.TextUtils;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class JpaProblemRepositoryAdapter implements ProblemRepository {
    private final ProblemEntityRepository problems;
    private final TestCaseEntityRepository testCases;

    public JpaProblemRepositoryAdapter(ProblemEntityRepository problems, TestCaseEntityRepository testCases) {
        this.problems = problems;
        this.testCases = testCases;
    }

    private static Problem toModel(ProblemEntity e) {
        return new Problem(e.getId(), e.getTitle(), e.getStatement(), e.getInputSpec(), e.getOutputSpec(), java.util.Collections.emptyList(), e.getConstraints());
    }

    private static TestCase toModel(TestCaseEntity e) {
        // Decode stored escape sequences (e.g., "\\n") into actual newlines for runtime and comparison
        String input = TextUtils.unescape(e.getInput());
        String expected = TextUtils.unescape(e.getExpectedOutput());
        return new TestCase(input, expected);
    }

    @Override
    public List<Problem> findAll() {
        return problems.findAll().stream().map(JpaProblemRepositoryAdapter::toModel).collect(Collectors.toList());
    }

    @Override
    public Optional<Problem> findById(String id) {
        return problems.findById(id).map(JpaProblemRepositoryAdapter::toModel);
    }

    @Override
    public List<TestCase> findTestCasesByProblemId(String problemId) {
        return testCases.findByProblem_IdAndIsSampleTrue(problemId).stream().map(JpaProblemRepositoryAdapter::toModel).collect(Collectors.toList());
    }

    @Override
    public List<TestCase> findAllTestCasesByProblemId(String problemId) {
        return testCases.findByProblem_Id(problemId).stream().map(JpaProblemRepositoryAdapter::toModel).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void saveProblem(Problem problem) {
        ProblemEntity e = new ProblemEntity();
        e.setId(problem.getId());
        e.setTitle(problem.getTitle());
        e.setStatement(problem.getStatement());
        e.setInputSpec(problem.getInputSpec());
        e.setOutputSpec(problem.getOutputSpec());
        e.setConstraints(problem.getConstraints());
        problems.save(e);
    }

    @Override
    @Transactional
    public void deleteProblem(String id) {
        problems.deleteById(id);
    }

    @Override
    @Transactional
    public void saveTestCase(String problemId, TestCase testCase) {
        ProblemEntity p = problems.findById(problemId).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + problemId));
        TestCaseEntity t = new TestCaseEntity();
        t.setProblem(p);
        // Store as-is; callers may choose to provide real newlines or escaped sequences
        t.setInput(testCase.getInput());
        t.setExpectedOutput(testCase.getExpectedOutput());
        t.setSample(true);
        testCases.save(t);
    }

    @Override
    @Transactional
    public void deleteTestCasesByProblemId(String problemId) {
        testCases.deleteByProblem_Id(problemId);
    }
}