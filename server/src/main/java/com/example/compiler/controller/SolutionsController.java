package com.example.compiler.controller;

import com.example.compiler.model.*;
import com.example.compiler.repo.ProblemRepository;
import com.example.compiler.service.JavaRunnerService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import com.example.compiler.util.TextUtils;
import com.example.compiler.compare.*;
import com.example.compiler.config.ComparisonConfig;
import com.example.compiler.security.HardcodeDetector;

@RestController
@RequestMapping(path = "/api/solutions", produces = MediaType.APPLICATION_JSON_VALUE)
public class SolutionsController {
    private final JavaRunnerService runner = new JavaRunnerService();
    private final ProblemRepository repo;
    private final OutputComparatorFactory comparatorFactory;
    private final ComparisonConfig comparisonConfig;
    private final HardcodeDetector hardcodeDetector = new HardcodeDetector();

    public SolutionsController(ProblemRepository repo, OutputComparatorFactory comparatorFactory, ComparisonConfig comparisonConfig) {
        this.repo = repo;
        this.comparatorFactory = comparatorFactory;
        this.comparisonConfig = comparisonConfig;
    }

    @PostMapping(path = "/run", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionRunResponse run(@RequestBody SolutionRunRequest req) throws Exception {
        Problem p = repo.findById(req.getProblemId()).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.getProblemId()));
        List<TestCase> samples = repo.findTestCasesByProblemId(p.getId());

        List<TestCaseResult> results = new ArrayList<>();
        ComparatorMode mode = comparisonConfig.forProblem(p.getId());
        OutputComparator comparator = comparatorFactory.get(mode);
        for (TestCase tc : samples) {
            JavaRunnerService.Result r = runner.compileAndRun(req.getCode(), tc.getInput());
            boolean passed = comparator.compare(tc.getExpectedOutput(), r.stdout) && r.exitCode == 0;
            // Memory usage is not tracked for the external process; set null
            results.add(new TestCaseResult(tc.getInput(), tc.getExpectedOutput(), r.stdout, r.stderr, r.exitCode, r.durationMs, passed, null));
        }
        boolean allPassed = results.stream().allMatch(TestCaseResult::isPassed);
        return new SolutionRunResponse(p.getId(), allPassed, results);
    }

    @PostMapping(path = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE)
    public SolutionSubmitResponse submit(@RequestBody SolutionSubmitRequest req) throws Exception {
        Problem p = repo.findById(req.getProblemId()).orElseThrow(() -> new IllegalArgumentException("Problem not found: " + req.getProblemId()));
        List<TestCase> allTests = repo.findAllTestCasesByProblemId(p.getId());
        ComparatorMode mode = comparisonConfig.forProblem(p.getId());
        OutputComparator comparator = comparatorFactory.get(mode);

        // Anti-hardcode check against all expected outputs
        boolean suspicious = hardcodeDetector.isSuspicious(req.getCode(), allTests);

        List<TestCaseResult> results = new ArrayList<>();
        for (TestCase tc : allTests) {
            JavaRunnerService.Result r = runner.compileAndRun(req.getCode(), tc.getInput());
            boolean passed = comparator.compare(tc.getExpectedOutput(), r.stdout) && r.exitCode == 0;
            // For non-sample tests, avoid leaking expected outputs
            String expectedOut = tc.getExpectedOutput();
            // We don't have a flag here; heuristic: if not present in samples, redact
            // Build a set of sample tests to compare would require an extra call; to keep simple, redact always on submit
            expectedOut = "(hidden)";
            results.add(new TestCaseResult(tc.getInput(), expectedOut, r.stdout, r.stderr, r.exitCode, r.durationMs, passed, null));
        }
        boolean allPassed = results.stream().allMatch(TestCaseResult::isPassed);
        boolean accepted = allPassed && !suspicious;
        String message = accepted ? "Accepted" : (suspicious ? "Rejected: suspected hardcoded outputs" : "Rejected");
        return new SolutionSubmitResponse(p.getId(), accepted, results, message);
    }

    // Normalization moved to TextUtils.normalizeOutput
}